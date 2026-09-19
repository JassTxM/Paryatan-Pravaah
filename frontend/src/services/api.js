import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

// ── Demo Data ─────────────────────────────────────────────────────────────────

const DEMO_DESTINATIONS = [
  {
    _id: 'demo-taj-mahal',
    name: 'Taj Mahal Complex',
    slug: 'taj-mahal',
    location: 'Agra, Uttar Pradesh',
    state: 'Uttar Pradesh',
    annual_visitors: 5800000,
    total_capacity: 2500,
    safe_threshold: 2125,
    base_price: 400,
    live_occupancy: 2120,
    status: 'ONLINE',
    description: 'UNESCO World Heritage Site. Mughal-era mausoleum built by Emperor Shah Jahan.',
    environment: { temperature_c: 29, humidity_pct: 61, rainfall_mm: 0.0, festival: true },
    zones: [
      { name: 'Outer Forecourt', capacity: 900, live_headcount: 842, flow_speed_kmh: 1.2 },
      { name: 'Garden Corridor', capacity: 700, live_headcount: 431, flow_speed_kmh: 2.8 },
      { name: 'Main Mausoleum', capacity: 500, live_headcount: 487, flow_speed_kmh: 0.8 },
      { name: 'Eastern Gallery', capacity: 400, live_headcount: 220, flow_speed_kmh: 2.1 },
    ]
  },
  {
    _id: 'demo-qutub-minar',
    name: 'Qutub Minar Complex',
    slug: 'qutub-minar',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    annual_visitors: 3900000,
    total_capacity: 1800,
    safe_threshold: 1530,
    base_price: 350,
    live_occupancy: 1270,
    status: 'ONLINE',
    description: 'UNESCO World Heritage Site. 73-metre tall minaret from the 13th century.',
    environment: { temperature_c: 32, humidity_pct: 55, rainfall_mm: 0.0, festival: false },
    zones: [
      { name: 'Entry Plaza', capacity: 600, live_headcount: 412, flow_speed_kmh: 2.4 },
      { name: 'Minar Courtyard', capacity: 700, live_headcount: 589, flow_speed_kmh: 1.5 },
      { name: 'Archaeological Park', capacity: 500, live_headcount: 271, flow_speed_kmh: 3.2 },
    ]
  },
  {
    _id: 'demo-red-fort',
    name: 'Red Fort Complex',
    slug: 'red-fort',
    location: 'New Delhi, Delhi',
    state: 'Delhi',
    annual_visitors: 4200000,
    total_capacity: 3000,
    safe_threshold: 2550,
    base_price: 500,
    live_occupancy: 1850,
    status: 'ONLINE',
    description: 'UNESCO World Heritage Site. Mughal imperial palace and fortress complex.',
    environment: { temperature_c: 31, humidity_pct: 58, rainfall_mm: 0.0, festival: false },
    zones: [
      { name: 'Lahori Gate', capacity: 800, live_headcount: 623, flow_speed_kmh: 1.8 },
      { name: 'Diwan-i-Aam', capacity: 1000, live_headcount: 742, flow_speed_kmh: 2.0 },
      { name: 'Palace Quarters', capacity: 700, live_headcount: 298, flow_speed_kmh: 2.5 },
      { name: 'Museum Zone', capacity: 500, live_headcount: 187, flow_speed_kmh: 1.4 },
    ]
  },
  {
    _id: 'demo-hampi',
    name: 'Hampi Ruins',
    slug: 'hampi',
    location: 'Hampi, Karnataka',
    state: 'Karnataka',
    annual_visitors: 1200000,
    total_capacity: 1200,
    safe_threshold: 1020,
    base_price: 250,
    live_occupancy: 574,
    status: 'ONLINE',
    description: 'UNESCO World Heritage Site. 14th-century Vijayanagara Empire capital.',
    environment: { temperature_c: 27, humidity_pct: 68, rainfall_mm: 1.2, festival: false },
    zones: [
      { name: 'Virupaksha Temple', capacity: 500, live_headcount: 287, flow_speed_kmh: 2.0 },
      { name: 'Vittala Complex', capacity: 400, live_headcount: 198, flow_speed_kmh: 2.8 },
      { name: 'Royal Enclosure', capacity: 300, live_headcount: 89, flow_speed_kmh: 3.5 },
    ]
  },
  {
    _id: 'demo-konark',
    name: 'Konark Sun Temple',
    slug: 'konark',
    location: 'Konark, Odisha',
    state: 'Odisha',
    annual_visitors: 1800000,
    total_capacity: 1500,
    safe_threshold: 1275,
    base_price: 300,
    live_occupancy: 896,
    status: 'ONLINE',
    description: 'UNESCO World Heritage Site. 13th-century Kalinga-style Sun Temple.',
    environment: { temperature_c: 26, humidity_pct: 72, rainfall_mm: 0.5, festival: false },
    zones: [
      { name: 'Entrance Mandapa', capacity: 600, live_headcount: 342, flow_speed_kmh: 2.2 },
      { name: 'Main Sanctum', capacity: 500, live_headcount: 398, flow_speed_kmh: 1.1 },
      { name: 'Sculpture Gallery', capacity: 400, live_headcount: 156, flow_speed_kmh: 2.9 },
    ]
  }
];

function generateDemoSlots(destId, date) {
  const pattern = [0.15,0.35,0.55,0.75,0.95,1.00,0.90,0.80,0.70,0.78,0.82,0.72,0.55,0.40];
  const dest = DEMO_DESTINATIONS.find(d => d._id === destId) || DEMO_DESTINATIONS[0];
  const capacity = dest.total_capacity;
  const maxCap = Math.floor(capacity / 14);
  const cSafe = 0.85 * capacity;

  return pattern.map((p, i) => {
    const hour = 6 + i;
    const flow = Math.round(capacity * p);
    let price, discount, risk, rec, status;
    if (flow < 0.40 * cSafe) {
      price = Math.round(dest.base_price * 0.75); discount = 25; risk = 'LOW';
      rec = 'BEST VALUE — Low crowds expected'; status = 'AVAILABLE';
    } else if (flow < 0.80 * cSafe) {
      price = dest.base_price; discount = 0; risk = 'MODERATE';
      rec = 'MODERATE FLOW — Pleasant visit expected'; status = 'AVAILABLE';
    } else {
      price = Math.round(dest.base_price * 1.40); discount = 0; risk = 'SURGE_RISK';
      rec = 'HIGH DEMAND — Expect ~45 min wait'; status = 'SURGE_RISK';
    }
    const booked = Math.floor(Math.random() * maxCap * 0.35);
    return {
      _id: `demo-slot-${destId}-${hour}`,
      destination_id: destId, date,
      hour_of_day: hour,
      time_label: `${String(hour).padStart(2,'0')}:00`,
      max_capacity: maxCap, booked_count: booked,
      remaining_tickets: Math.max(0, maxCap - booked),
      predicted_flow: flow, base_price: dest.base_price,
      dynamic_price: price, discount_pct: discount,
      risk_level: risk, status, recommendation: rec
    };
  });
}

function generateDemoForecast(dest) {
  const pattern = [0.02,0.01,0.01,0.01,0.02,0.05,0.15,0.35,0.55,0.75,0.95,1.00,
                   0.90,0.80,0.70,0.78,0.82,0.72,0.55,0.40,0.28,0.18,0.10,0.05];
  const cSafe = dest.safe_threshold;
  const now = new Date().getHours();
  return pattern.map((p, hour) => {
    const flow = Math.round(dest.total_capacity * p * (dest.environment?.festival ? 1.3 : 1.0));
    return {
      hour, predicted_flow: flow, safe_limit: cSafe,
      risk_level: flow >= cSafe * 0.94 ? 'SURGE_RISK' : flow >= cSafe * 0.75 ? 'MODERATE' : 'LOW',
      confidence: Math.round(88 + Math.sin(hour * 0.5) * 6),
      is_historical: hour < now, is_current: hour === now, is_projected: hour > now,
      actual_flow: hour < now ? Math.round(flow * (0.9 + Math.random() * 0.18)) : null
    };
  });
}

function generateDemoTelemetry(dest) {
  const now = new Date().getHours();
  const twoHourInflow = Math.round(dest.total_capacity * 0.15);
  const occ = dest.live_occupancy;
  const cSafe = dest.safe_threshold;
  const satPct = Math.round((occ / dest.total_capacity) * 1000) / 10;
  const chokeZone = dest.zones?.find(z => (z.live_headcount / z.capacity) > 0.88);
  const isAlerted = occ >= cSafe * 0.95;

  return {
    destination: { _id: dest._id, name: dest.name, location: dest.location },
    current_visitors: occ,
    capacity: dest.total_capacity,
    safe_threshold: cSafe,
    saturation_pct: satPct,
    predicted_two_hour_inflow: twoHourInflow,
    choke_point: chokeZone ? { zone: chokeZone.name, alert: 'CRITICAL_SURGE', confidence: 92, actions: ['THROTTLE_SLOT','DEPLOY_MARSHALS','PUSH_OFF_PEAK_PROMOS'] } : null,
    alert: isAlerted ? 'CRITICAL_SURGE' : 'NORMAL',
    alert_confidence: isAlerted ? 92 : null,
    alert_actions: isAlerted ? ['THROTTLE_SLOT','DEPLOY_MARSHALS','PUSH_OFF_PEAK_PROMOS'] : [],
    environment: dest.environment,
    zones: dest.zones?.map(z => ({
      ...z,
      saturation_pct: Math.round((z.live_headcount / z.capacity) * 1000) / 10,
      status: (z.live_headcount / z.capacity) >= 0.90 ? 'CRITICAL' : (z.live_headcount / z.capacity) >= 0.75 ? 'WARNING' : 'SAFE'
    })),
    last_sync: new Date().toISOString()
  };
}

// ── API Functions ─────────────────────────────────────────────────────────────

let isDemo = false;

export function isDemoMode() { return isDemo; }

async function tryApi(fn, demoFn) {
  try {
    const result = await fn();
    isDemo = false;
    return result;
  } catch {
    isDemo = true;
    return demoFn();
  }
}

export const getDestinations = () =>
  tryApi(
    async () => { const r = await api.get('/destinations'); return r.data.data; },
    () => DEMO_DESTINATIONS
  );

export const getSlots = (destinationId, date) =>
  tryApi(
    async () => { const r = await api.get(`/slots?destination_id=${destinationId}&date=${date}`); return r.data.data; },
    () => generateDemoSlots(destinationId, date)
  );

export const createBooking = async (payload) => {
  try {
    const r = await api.post('/bookings', payload);
    isDemo = false;
    return r.data.data;
  } catch {
    isDemo = true;
    // Demo booking
    return {
      booking_ref: `PP-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      visitor_name: payload.visitor_name,
      ticket_count: payload.ticket_count,
      price_per_ticket: 400,
      total_amount: payload.ticket_count * 400,
      qr_token: `demo-qr-${Date.now()}`,
      gate: 'GATE 2',
      slot_time_label: '10:00',
      destination_name: 'Taj Mahal Complex',
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    };
  }
};

export const getTelemetry = (destinationId) =>
  tryApi(
    async () => { const r = await api.get(`/admin/telemetry?destination_id=${destinationId}`); return r.data.data; },
    () => generateDemoTelemetry(DEMO_DESTINATIONS[0])
  );

export const getForecastCurve = (destinationId) =>
  tryApi(
    async () => { const r = await api.get(`/admin/forecast-curve?destination_id=${destinationId}`); return { data: r.data.data, safe_limit: r.data.safe_limit }; },
    () => {
      const dest = DEMO_DESTINATIONS[0];
      return { data: generateDemoForecast(dest), safe_limit: dest.safe_threshold };
    }
  );

export const throttleSlot = async (payload) => {
  try {
    const r = await api.post('/admin/throttle-slot', payload);
    return r.data;
  } catch {
    return { success: true, message: 'Slot inventory throttled. [DEMO]', action: 'THROTTLE_SLOT' };
  }
};

export const dispatchMarshals = async (payload) => {
  try {
    const r = await api.post('/admin/dispatch-marshals', payload);
    return r.data;
  } catch {
    return { success: true, message: 'Field marshals dispatched. [DEMO]', eta_minutes: 4, zone: 'Gate 2' };
  }
};

export const deployOffPeak = async (payload) => {
  try {
    const r = await api.post('/admin/deploy-offpeak', payload);
    return r.data;
  } catch {
    return { success: true, message: 'Off-peak discounts deployed. [DEMO]', slots_affected: 5 };
  }
};

export { DEMO_DESTINATIONS };
