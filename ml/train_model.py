#!/usr/bin/env python3
"""
Paryatan Pravaah — ML Training Pipeline
Trains a crowd flow prediction model for heritage destinations.

NOTE: This deployment uses a SYNTHETIC DEMO DATASET as the
rural_tourism_passenger_flow_pricing_dataset.csv file is not present.
Model outputs are clearly labeled as DEMO predictions.
"""

import os
import sys
import json
import math
import random
import warnings
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

warnings.filterwarnings("ignore")

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "paryatan_pravaah_model.joblib")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "rural_tourism_passenger_flow_pricing_dataset.csv")

os.makedirs(ARTIFACTS_DIR, exist_ok=True)


def generate_synthetic_dataset(n_rows=5000):
    """
    Generate a realistic synthetic dataset for heritage site visitor flow.
    Deterministic seed for reproducibility.
    CLEARLY LABELED AS DEMO/SYNTHETIC DATA.
    """
    print("\n[DEMO DATA] Generating synthetic dataset (CSV not found)")
    print("[DEMO DATA] Label: synthetic — not real government statistics\n")

    np.random.seed(42)
    random.seed(42)

    days = pd.date_range(start="2022-01-01", periods=n_rows, freq="h")
    df = pd.DataFrame()

    df["timestamp"] = days
    df["hour_of_day"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.day_name()
    df["month"] = df["timestamp"].dt.month
    df["is_weekend"] = df["timestamp"].dt.dayofweek >= 5
    df["is_holiday"] = np.random.choice([0, 1], size=n_rows, p=[0.93, 0.07])
    df["season"] = df["month"].map({
        1:"Winter",2:"Winter",3:"Summer",4:"Summer",5:"Summer",
        6:"Monsoon",7:"Monsoon",8:"Monsoon",9:"Monsoon",
        10:"Autumn",11:"Autumn",12:"Winter"
    })
    df["weather_condition"] = np.random.choice(
        ["Sunny","Partly Cloudy","Overcast","Rainy"],
        size=n_rows, p=[0.45, 0.30, 0.15, 0.10]
    )
    df["temperature_c"] = 20 + 10 * np.sin((df["month"] - 3) * np.pi / 6) + np.random.normal(0, 2, n_rows)
    df["humidity_pct"] = 50 + 20 * np.sin((df["month"] - 6) * np.pi / 6) + np.random.normal(0, 5, n_rows)
    df["rainfall_mm"] = np.where(df["weather_condition"] == "Rainy", np.random.exponential(5, n_rows), 0)
    df["air_quality_index"] = np.random.randint(50, 200, n_rows)
    df["local_event_flag"] = np.random.choice([0, 1], size=n_rows, p=[0.85, 0.15])
    df["event_popularity_score"] = np.where(df["local_event_flag"] == 1, np.random.randint(3, 10, n_rows), 0)
    df["road_congestion_index"] = np.random.uniform(0.2, 0.9, n_rows)
    df["destination_capacity"] = np.random.choice([1500, 2500, 3000, 1800, 1200], size=n_rows)

    # Realistic hourly pattern
    hour_pattern = np.array([
        50, 30, 20, 20, 40, 120,
        350, 800, 1200, 1700, 2100, 2300,
        2000, 1800, 1600, 1750, 1900, 1600,
        1200, 900, 650, 400, 200, 100
    ])
    df["base_flow"] = hour_pattern[df["hour_of_day"].values]

    # Modifiers
    df["weekend_boost"] = np.where(df["is_weekend"], 1.25, 1.0)
    df["holiday_boost"] = np.where(df["is_holiday"], 1.40, 1.0)
    df["rain_penalty"] = np.where(df["rainfall_mm"] > 2, 0.70, 1.0)
    df["event_boost"] = 1 + df["event_popularity_score"] * 0.04

    df["visitor_count"] = (
        df["base_flow"] * df["weekend_boost"] * df["holiday_boost"] *
        df["rain_penalty"] * df["event_boost"]
    ).astype(int).clip(0, 3000)

    # Lag features
    df["visitor_count_lag_1"] = df["visitor_count"].shift(1).fillna(0)
    df["visitor_count_lag_2"] = df["visitor_count"].shift(2).fillna(0)
    df["visitor_count_lag_24"] = df["visitor_count"].shift(24).fillna(0)
    df["rolling_avg_flow"] = df["visitor_count"].rolling(6, min_periods=1).mean()

    # Target: next hour flow
    df["future_passenger_flow"] = df["visitor_count"].shift(-1).fillna(0)
    df = df.dropna().reset_index(drop=True)

    print(f"[DEMO DATA] Generated {len(df)} synthetic training samples")
    return df


def load_dataset():
    """Load CSV if present, otherwise use synthetic fallback."""
    if os.path.exists(CSV_PATH):
        print(f"[DATA] Loading: {CSV_PATH}")
        df = pd.read_csv(CSV_PATH)
        print(f"[DATA] Loaded {len(df)} rows from CSV")
        return df, False  # not synthetic
    else:
        df = generate_synthetic_dataset()
        return df, True  # synthetic


def prepare_features(df):
    """Prepare feature matrix from dataframe."""
    categorical_cols = ["day_of_week", "season", "weather_condition"]
    numerical_cols = [
        "hour_of_day", "month", "temperature_c", "humidity_pct",
        "rainfall_mm", "air_quality_index", "local_event_flag",
        "event_popularity_score", "road_congestion_index", "destination_capacity",
        "visitor_count_lag_1", "visitor_count_lag_2", "visitor_count_lag_24",
        "rolling_avg_flow"
    ]
    # Add is_weekend, is_holiday as int
    if "is_weekend" in df.columns:
        df["is_weekend"] = df["is_weekend"].astype(int)
    if "is_holiday" in df.columns:
        df["is_holiday"] = df["is_holiday"].astype(int)
    numerical_cols = ["is_weekend", "is_holiday"] + numerical_cols

    # Filter to available columns
    cat_available = [c for c in categorical_cols if c in df.columns]
    num_available = [c for c in numerical_cols if c in df.columns]

    return df, cat_available, num_available


def train():
    print("╔══════════════════════════════════════════╗")
    print("║  PARYATAN PRAVAAH — ML Training Engine   ║")
    print("╚══════════════════════════════════════════╝")

    df, is_synthetic = load_dataset()
    df, cat_cols, num_cols = prepare_features(df)

    target = "future_passenger_flow"
    if target not in df.columns:
        # Fallback target
        target = df.columns[-1]
        print(f"[WARNING] Using column '{target}' as target")

    X = df[cat_cols + num_cols]
    y = df[target].clip(0)

    # Train/val split
    split = int(len(df) * 0.8)
    X_train, X_val = X.iloc[:split], X.iloc[split:]
    y_train, y_val = y.iloc[:split], y.iloc[split:]

    print(f"\n[TRAIN] Features: {len(cat_cols)} categorical + {len(num_cols)} numerical")
    print(f"[TRAIN] Train size: {len(X_train)} | Val size: {len(X_val)}")

    # Preprocessing pipeline
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler, OneHotEncoder
    from sklearn.pipeline import Pipeline
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ("num", StandardScaler(), num_cols)
    ])

    # Try LightGBM first, fallback to RandomForest
    try:
        import lightgbm as lgb
        model_core = lgb.LGBMRegressor(
            n_estimators=200, learning_rate=0.05, max_depth=8,
            num_leaves=63, random_state=42, verbose=-1
        )
        model_name = "LightGBM"
    except ImportError:
        from sklearn.ensemble import RandomForestRegressor
        model_core = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model_name = "RandomForest"

    print(f"[MODEL] Using: {model_name}")

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model_core)
    ])

    print("[TRAIN] Fitting pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_val)
    mae = mean_absolute_error(y_val, y_pred)
    rmse = math.sqrt(mean_squared_error(y_val, y_pred))
    r2 = r2_score(y_val, y_pred)

    print(f"\n[EVAL] Results:")
    print(f"  MAE:  {mae:.2f} visitors")
    print(f"  RMSE: {rmse:.2f} visitors")
    print(f"  R²:   {r2:.4f}")

    # Persist model
    import joblib
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\n[SAVED] Model saved to: {MODEL_PATH}")

    # Save metadata
    meta = {
        "model_name": model_name,
        "is_synthetic_data": is_synthetic,
        "train_size": int(len(X_train)),
        "val_size": int(len(X_val)),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
        "features_categorical": cat_cols,
        "features_numerical": num_cols,
        "target": target,
        "trained_at": datetime.utcnow().isoformat()
    }
    with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("\n╔══════════════════════════════════════════╗")
    print(f"║  Training complete!                      ║")
    print(f"║  Model: {model_name:<33}║")
    print(f"║  R² Score: {r2:.4f}                         ║")
    if is_synthetic:
        print("║  ⚠ DEMO DATA — Synthetic dataset used    ║")
    print("╚══════════════════════════════════════════╝\n")


if __name__ == "__main__":
    train()
