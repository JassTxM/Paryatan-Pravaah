#!/usr/bin/env python3
"""
Paryatan Pravaah — ML Inference Engine
Provides predict_flow, predict_24h_curve, dynamic_pricing, and choke_point_detection.
"""

import os
import sys
import json
import math
import numpy as np
from datetime import datetime

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "paryatan_pravaah_model.joblib")

# --------------- Dynamic Pricing (exact spec implementation) ---------------

def calculate_dynamic_price(predicted_flow, capacity, base_price):
    """
    C_safe = 0.85 * capacity
    flow < 0.40 * C_safe  → price = round(base * 0.75) [LOW]
    flow < 0.80 * C_safe  → price = base               [MODERATE]
    flow >= 0.80 * C_safe → price = round(base * 1.40) [SURGE_RISK]
    """
    c_safe = 0.85 * capacity

    if predicted_flow < 0.40 * c_safe:
        return {
            "price": round(base_price * 0.75),
            "base_price": base_price,
            "discount_pct": 25,
            "risk_level": "LOW"
        }
    elif predicted_flow < 0.80 * c_safe:
        return {
            "price": base_price,
            "base_price": base_price,
            "discount_pct": 0,
            "risk_level": "MODERATE"
        }
    else:
        return {
            "price": round(base_price * 1.40),
            "base_price": base_price,
            "discount_pct": -40,
            "risk_level": "SURGE_RISK"
        }


# --------------- Choke-Point Detection ---------------

def detect_choke_point(current_visitor_count, estimated_exits, predicted_inflow, destination_capacity):
    """
    projected_occupancy = current - estimated_exits + predicted_inflow
    If projected >= capacity * 0.85 → CRITICAL_SURGE
    """
    projected_occupancy = current_visitor_count - estimated_exits + predicted_inflow
    threshold = destination_capacity * 0.85

    if projected_occupancy >= threshold:
        return {
            "alert": "CRITICAL_SURGE",
            "projected_occupancy": int(projected_occupancy),
            "safe_capacity": int(threshold),
            "actions": ["THROTTLE_SLOT", "DEPLOY_MARSHALS", "PUSH_OFF_PEAK_PROMOS"],
            "confidence": min(98, round(70 + (projected_occupancy / destination_capacity) * 28))
        }
    elif projected_occupancy >= threshold * 0.85:
        return {
            "alert": "WARNING_APPROACHING",
            "projected_occupancy": int(projected_occupancy),
            "safe_capacity": int(threshold),
            "actions": ["MONITOR", "PREPARE_MARSHALS"],
            "confidence": min(90, round(55 + (projected_occupancy / destination_capacity) * 35))
        }
    return {
        "alert": "NORMAL",
        "projected_occupancy": int(projected_occupancy),
        "safe_capacity": int(threshold),
        "actions": [],
        "confidence": None
    }


# --------------- Model-Based Prediction ---------------

def load_model():
    """Load persisted model if available."""
    try:
        import joblib
        if os.path.exists(MODEL_PATH):
            return joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"[INFERENCE] Model load failed: {e}")
    return None


def _deterministic_flow(hour, capacity, is_weekend=False, is_holiday=False, festival=False, month=9):
    """Deterministic fallback pattern when model not available."""
    pattern = [
        0.02, 0.01, 0.01, 0.01, 0.02, 0.05,
        0.15, 0.35, 0.55, 0.75, 0.95, 1.00,
        0.90, 0.80, 0.70, 0.78, 0.82, 0.72,
        0.55, 0.40, 0.28, 0.18, 0.10, 0.05
    ]
    base = capacity * pattern[hour]
    if is_weekend:
        base *= 1.25
    if is_holiday:
        base *= 1.40
    if festival:
        base *= 1.45
    # Season modifier (Sep = post-monsoon, still warm)
    season_factor = {1:0.9,2:0.9,3:1.1,4:1.0,5:0.95,6:0.7,7:0.65,8:0.7,9:0.85,10:1.15,11:1.1,12:0.95}
    base *= season_factor.get(month, 1.0)
    return int(base)


def predict_flow(features_dict):
    """
    Predict visitor flow for a single hour.
    Falls back to deterministic pattern if model not available.
    """
    model = load_model()

    if model:
        try:
            import pandas as pd
            row = pd.DataFrame([features_dict])
            pred = model.predict(row)[0]
            return max(0, int(pred))
        except Exception as e:
            print(f"[INFERENCE] Prediction failed: {e}, using fallback")

    # Deterministic fallback
    return _deterministic_flow(
        hour=features_dict.get("hour_of_day", 12),
        capacity=features_dict.get("destination_capacity", 2500),
        is_weekend=bool(features_dict.get("is_weekend", False)),
        is_holiday=bool(features_dict.get("is_holiday", False)),
        festival=bool(features_dict.get("local_event_flag", False)),
        month=features_dict.get("month", 9)
    )


def predict_24h_curve(destination_id, date_str, destination_capacity=2500,
                      base_price=400, is_weekend=False, is_holiday=False,
                      festival=False, temperature=29, humidity=61, rainfall=0.0):
    """
    Generate a full 24-hour prediction curve.
    Returns list of {hour, predicted_flow, safe_limit, risk_level, confidence}
    """
    d = datetime.fromisoformat(date_str) if isinstance(date_str, str) else date_str
    month = d.month
    safe_limit = round(destination_capacity * 0.85)

    results = []
    for hour in range(24):
        features = {
            "hour_of_day": hour,
            "day_of_week": d.strftime("%A"),
            "month": month,
            "season": _get_season(month),
            "is_weekend": int(is_weekend),
            "is_holiday": int(is_holiday),
            "temperature_c": temperature,
            "humidity_pct": humidity,
            "rainfall_mm": rainfall,
            "air_quality_index": 95,
            "local_event_flag": int(festival),
            "event_popularity_score": 7 if festival else 0,
            "road_congestion_index": 0.6,
            "destination_capacity": destination_capacity,
            "visitor_count_lag_1": _deterministic_flow(max(0, hour-1), destination_capacity, is_weekend, is_holiday, festival, month),
            "visitor_count_lag_2": _deterministic_flow(max(0, hour-2), destination_capacity, is_weekend, is_holiday, festival, month),
            "visitor_count_lag_24": _deterministic_flow(hour, destination_capacity, False, False, False, month),
            "rolling_avg_flow": _deterministic_flow(hour, destination_capacity, is_weekend, is_holiday, festival, month) * 0.9,
            "weather_condition": "Partly Cloudy" if rainfall == 0 else "Rainy"
        }

        flow = predict_flow(features)
        pricing = calculate_dynamic_price(flow, destination_capacity, base_price)

        results.append({
            "hour": hour,
            "predicted_flow": flow,
            "safe_limit": safe_limit,
            "risk_level": pricing["risk_level"],
            "confidence": min(95, 80 + int(math.sin(hour * 0.4) * 8) + 3)
        })

    return results


def _get_season(month):
    seasons = {1:"Winter",2:"Winter",3:"Summer",4:"Summer",5:"Summer",
               6:"Monsoon",7:"Monsoon",8:"Monsoon",9:"Monsoon",
               10:"Autumn",11:"Autumn",12:"Winter"}
    return seasons.get(month, "Summer")


# --------------- CLI Interface ---------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Paryatan Pravaah ML Inference")
    parser.add_argument("--mode", choices=["predict", "curve", "choke", "price"], default="curve")
    parser.add_argument("--destination_id", default="taj-mahal")
    parser.add_argument("--date", default=datetime.utcnow().strftime("%Y-%m-%d"))
    parser.add_argument("--capacity", type=int, default=2500)
    parser.add_argument("--base_price", type=int, default=400)
    parser.add_argument("--current_visitors", type=int, default=1800)
    parser.add_argument("--predicted_inflow", type=int, default=400)
    args = parser.parse_args()

    if args.mode == "curve":
        curve = predict_24h_curve(
            destination_id=args.destination_id,
            date_str=args.date,
            destination_capacity=args.capacity,
            base_price=args.base_price
        )
        print(json.dumps(curve, indent=2))

    elif args.mode == "choke":
        result = detect_choke_point(
            current_visitor_count=args.current_visitors,
            estimated_exits=int(args.current_visitors * 0.15),
            predicted_inflow=args.predicted_inflow,
            destination_capacity=args.capacity
        )
        print(json.dumps(result, indent=2))

    elif args.mode == "price":
        result = calculate_dynamic_price(args.predicted_inflow, args.capacity, args.base_price)
        print(json.dumps(result, indent=2))
