#!/usr/bin/env python3
"""
Paryatan Pravaah — MongoDB Seed Script
Seeds the database with curated Indian heritage monument data.
Uses DEMO DATA since CSV files are not present in this deployment.
"""

import json
import sys
import math
import random
from datetime import datetime, timedelta

try:
    from pymongo import MongoClient
    from bson import ObjectId
except ImportError:
    print("ERROR: pymongo not installed. Run: pip install pymongo")
    sys.exit(1)

MONGO_URI = "mongodb://localhost:27017/paryatan_pravaah"
DB_NAME = "paryatan_pravaah"

# Curated Indian heritage monument data
DESTINATIONS = [
    {
        "name": "Taj Mahal Complex",
        "slug": "taj-mahal",
        "location": "Agra, Uttar Pradesh",
        "state": "Uttar Pradesh",
        "annual_visitors": 5800000,
        "total_capacity": 2500,
        "base_price": 400,
        "description": "UNESCO World Heritage Site. Mughal-era mausoleum built by Emperor Shah Jahan.",
        "image_url": "/images/taj-mahal.jpg",
        "zones": [
            {"name": "Outer Forecourt", "capacity": 900, "live_headcount": 842, "flow_speed_kmh": 1.2},
            {"name": "Garden Corridor", "capacity": 700, "live_headcount": 431, "flow_speed_kmh": 2.8},
            {"name": "Main Mausoleum", "capacity": 500, "live_headcount": 487, "flow_speed_kmh": 0.8},
            {"name": "Eastern Gallery", "capacity": 400, "live_headcount": 220, "flow_speed_kmh": 2.1},
        ],
        "environment": {
            "temperature_c": 29, "humidity_pct": 61, "rainfall_mm": 0.0, "festival": True
        }
    },
    {
        "name": "Qutub Minar Complex",
        "slug": "qutub-minar",
        "location": "New Delhi, Delhi",
        "state": "Delhi",
        "annual_visitors": 3900000,
        "total_capacity": 1800,
        "base_price": 350,
        "description": "UNESCO World Heritage Site. 73-metre tall minaret from the 13th century.",
        "image_url": "/images/qutub-minar.jpg",
        "zones": [
            {"name": "Entry Plaza", "capacity": 600, "live_headcount": 412, "flow_speed_kmh": 2.4},
            {"name": "Minar Courtyard", "capacity": 700, "live_headcount": 589, "flow_speed_kmh": 1.5},
            {"name": "Archaeological Park", "capacity": 500, "live_headcount": 271, "flow_speed_kmh": 3.2},
        ],
        "environment": {
            "temperature_c": 32, "humidity_pct": 55, "rainfall_mm": 0.0, "festival": False
        }
    },
    {
        "name": "Red Fort Complex",
        "slug": "red-fort",
        "location": "New Delhi, Delhi",
        "state": "Delhi",
        "annual_visitors": 4200000,
        "total_capacity": 3000,
        "base_price": 500,
        "description": "UNESCO World Heritage Site. Mughal imperial palace and fortress complex.",
        "image_url": "/images/red-fort.jpg",
        "zones": [
            {"name": "Lahori Gate", "capacity": 800, "live_headcount": 623, "flow_speed_kmh": 1.8},
            {"name": "Diwan-i-Aam", "capacity": 1000, "live_headcount": 742, "flow_speed_kmh": 2.0},
            {"name": "Palace Quarters", "capacity": 700, "live_headcount": 298, "flow_speed_kmh": 2.5},
            {"name": "Museum Zone", "capacity": 500, "live_headcount": 187, "flow_speed_kmh": 1.4},
        ],
        "environment": {
            "temperature_c": 31, "humidity_pct": 58, "rainfall_mm": 0.0, "festival": False
        }
    },
    {
        "name": "Hampi Ruins",
        "slug": "hampi",
        "location": "Hampi, Karnataka",
        "state": "Karnataka",
        "annual_visitors": 1200000,
        "total_capacity": 1200,
        "base_price": 250,
        "description": "UNESCO World Heritage Site. 14th-century Vijayanagara Empire capital.",
        "image_url": "/images/hampi.jpg",
        "zones": [
            {"name": "Virupaksha Temple", "capacity": 500, "live_headcount": 287, "flow_speed_kmh": 2.0},
            {"name": "Vittala Complex", "capacity": 400, "live_headcount": 198, "flow_speed_kmh": 2.8},
            {"name": "Royal Enclosure", "capacity": 300, "live_headcount": 89, "flow_speed_kmh": 3.5},
        ],
        "environment": {
            "temperature_c": 27, "humidity_pct": 68, "rainfall_mm": 1.2, "festival": False
        }
    },
    {
        "name": "Konark Sun Temple",
        "slug": "konark",
        "location": "Konark, Odisha",
        "state": "Odisha",
        "annual_visitors": 1800000,
        "total_capacity": 1500,
        "base_price": 300,
        "description": "UNESCO World Heritage Site. 13th-century Kalinga-style Sun Temple.",
        "image_url": "/images/konark.jpg",
        "zones": [
            {"name": "Entrance Mandapa", "capacity": 600, "live_headcount": 342, "flow_speed_kmh": 2.2},
            {"name": "Main Sanctum", "capacity": 500, "live_headcount": 398, "flow_speed_kmh": 1.1},
            {"name": "Sculpture Gallery", "capacity": 400, "live_headcount": 156, "flow_speed_kmh": 2.9},
        ],
        "environment": {
            "temperature_c": 26, "humidity_pct": 72, "rainfall_mm": 0.5, "festival": False
        }
    }
]


def generate_hourly_slots(dest_id, dest, date_str):
    """Generate demo slot allocations for a destination and date."""
    capacity = dest["total_capacity"]
    base_price = dest["base_price"]
    c_safe = 0.85 * capacity

    # Hourly visitor pattern (normalized 0-1)
    pattern = [
        0.02, 0.01, 0.01, 0.01, 0.02, 0.05,
        0.15, 0.35, 0.55, 0.75, 0.95, 1.00,
        0.90, 0.80, 0.70, 0.78, 0.82, 0.72,
        0.55, 0.40, 0.28, 0.18, 0.10, 0.05
    ]

    slots = []
    for hour in range(6, 20):
        predicted_flow = int(capacity * pattern[hour])
        max_cap = max(30, capacity // 14)

        # Dynamic pricing
        if predicted_flow < 0.40 * c_safe:
            dynamic_price = round(base_price * 0.75)
            discount_pct = 25
            risk_level = "LOW"
            recommendation = "BEST VALUE — Low crowds expected"
            status = "AVAILABLE"
        elif predicted_flow < 0.80 * c_safe:
            dynamic_price = base_price
            discount_pct = 0
            risk_level = "MODERATE"
            recommendation = "MODERATE FLOW — Pleasant visit expected"
            status = "AVAILABLE"
        else:
            dynamic_price = round(base_price * 1.40)
            discount_pct = 0
            risk_level = "SURGE_RISK"
            recommendation = "HIGH DEMAND — Expect ~45 min wait"
            status = "SURGE_RISK"

        # Some pre-booked tickets
        pre_booked = random.randint(0, max(0, max_cap // 3))
        time_label = f"{hour:02d}:00"

        slots.append({
            "destination_id": dest_id,
            "date": date_str,
            "hour_of_day": hour,
            "time_label": time_label,
            "max_capacity": max_cap,
            "booked_count": pre_booked,
            "predicted_flow": predicted_flow,
            "base_price": base_price,
            "dynamic_price": dynamic_price,
            "discount_pct": discount_pct,
            "risk_level": risk_level,
            "status": status,
            "recommendation": recommendation,
            "throttled": False,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
    return slots


def main():
    print("\n╔══════════════════════════════════════════╗")
    print("║  PARYATAN PRAVAAH — MongoDB Seed Script  ║")
    print("║  NOTE: Using DEMO DATA (synthetic)       ║")
    print("╚══════════════════════════════════════════╝\n")

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        client.server_info()
        print(f"✓ Connected to MongoDB: {MONGO_URI}")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        print("  Make sure MongoDB is running: mongod --dbpath /data/db")
        sys.exit(1)

    db = client[DB_NAME]

    # Clear existing demo data
    print("\nClearing existing collections...")
    db.destinations.drop()
    db.slot_allocations.drop()
    db.bookings.drop()
    db.telemetry_logs.drop()
    print("✓ Collections cleared")

    # Seed destinations
    print("\nSeeding destinations...")
    today = datetime.utcnow().strftime("%Y-%m-%d")
    tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")

    dest_ids = []
    for dest_data in DESTINATIONS:
        total_capacity = dest_data["total_capacity"]
        safe_threshold = round(total_capacity * 0.85)
        live_occ = sum(z["live_headcount"] for z in dest_data["zones"])

        doc = {
            **dest_data,
            "safe_threshold": safe_threshold,
            "live_occupancy": live_occ,
            "status": "ONLINE",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = db.destinations.insert_one(doc)
        dest_ids.append((result.inserted_id, dest_data))
        print(f"  ✓ {dest_data['name']} (capacity: {total_capacity}, safe: {safe_threshold})")

    # Seed slots for today and tomorrow
    print("\nGenerating slot allocations...")
    all_slots = []
    for dest_id, dest_data in dest_ids:
        for date in [today, tomorrow]:
            slots = generate_hourly_slots(dest_id, dest_data, date)
            all_slots.extend(slots)

    if all_slots:
        db.slot_allocations.insert_many(all_slots)
        print(f"  ✓ {len(all_slots)} slots created across {len(dest_ids)} destinations × 2 days")

    # Seed some demo bookings
    print("\nSeeding demo bookings...")
    if dest_ids:
        main_dest_id, main_dest = dest_ids[0]
        demo_bookings = []
        names = ["Arjun Mehta", "Priya Sharma", "Rahul Gupta", "Sunita Patel", "Vikram Singh"]
        for i, name in enumerate(names):
            demo_bookings.append({
                "booking_ref": f"PP-2026-0{i+1:04d}",
                "destination_id": main_dest_id,
                "slot_id": ObjectId(),
                "visitor_name": name,
                "visitor_email": f"{name.lower().replace(' ', '.')}@example.com",
                "ticket_count": random.randint(1, 4),
                "price_per_ticket": main_dest["base_price"],
                "total_amount": main_dest["base_price"] * random.randint(1, 4),
                "qr_token": f"demo-qr-{i+1:04d}",
                "gate": "GATE 2",
                "slot_time_label": f"{10+i:02d}:00",
                "destination_name": main_dest["name"],
                "status": "CONFIRMED",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            })
        db.bookings.insert_many(demo_bookings)
        print(f"  ✓ {len(demo_bookings)} demo bookings created")

    # Seed telemetry logs (last 24 hours)
    print("\nSeeding telemetry logs...")
    telem_docs = []
    now = datetime.utcnow()
    for dest_id, dest_data in dest_ids[:2]:  # First 2 destinations
        pattern = [0.02,0.01,0.01,0.01,0.02,0.05,0.15,0.35,0.55,0.75,0.95,1.00,
                   0.90,0.80,0.70,0.78,0.82,0.72,0.55,0.40,0.28,0.18,0.10,0.05]
        for h in range(24):
            ts = now - timedelta(hours=24-h)
            visitor_count = int(dest_data["total_capacity"] * pattern[h] * (0.9 + random.random() * 0.2))
            safe_limit = round(dest_data["total_capacity"] * 0.85)
            risk = "SURGE_RISK" if visitor_count >= safe_limit else ("MODERATE" if visitor_count >= safe_limit * 0.7 else "LOW")
            telem_docs.append({
                "destination_id": dest_id,
                "timestamp": ts,
                "hour_of_day": h,
                "day_of_week": ts.strftime("%A"),
                "visitor_count": visitor_count,
                "predicted_flow": int(visitor_count * 1.05),
                "safe_limit": safe_limit,
                "risk_level": risk,
                "temperature_c": dest_data["environment"]["temperature_c"],
                "humidity_pct": dest_data["environment"]["humidity_pct"],
                "rainfall_mm": dest_data["environment"]["rainfall_mm"],
                "is_weekend": ts.weekday() >= 5,
                "is_holiday": False,
                "festival_flag": dest_data["environment"]["festival"]
            })

    db.telemetry_logs.insert_many(telem_docs)
    print(f"  ✓ {len(telem_docs)} telemetry records created")

    # Create indexes
    print("\nCreating database indexes...")
    db.slot_allocations.create_index([("destination_id", 1), ("date", 1)])
    db.slot_allocations.create_index(
        [("destination_id", 1), ("date", 1), ("hour_of_day", 1)], unique=True
    )
    db.telemetry_logs.create_index([("destination_id", 1), ("timestamp", -1)])
    db.bookings.create_index([("booking_ref", 1)], unique=True)
    print("  ✓ Indexes created")

    print("\n╔══════════════════════════════════════════╗")
    print("║  Seed complete! Summary:                 ║")
    print(f"║  Destinations:    {len(DESTINATIONS):3d}                      ║")
    print(f"║  Slot allocations:{len(all_slots):3d}                      ║")
    print(f"║  Demo bookings:     5                      ║")
    print(f"║  Telemetry logs:  {len(telem_docs):3d}                      ║")
    print("╚══════════════════════════════════════════╝\n")

    client.close()


if __name__ == "__main__":
    main()
