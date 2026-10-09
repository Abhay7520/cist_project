import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error
from xgboost import XGBRegressor, XGBClassifier

def train_weather_models():
    print("=" * 60)
    print("STARTING WEATHER & WEATHER-AWARE DEMAND MODEL TRAINING")
    print("Dataset: data/energy_weather_raw_data.csv")
    print("=" * 60)

    csv_path = os.path.join("data", "energy_weather_raw_data.csv")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        return

    # 1. Load Data
    print("\n1. Loading dataset...")
    df = pd.read_csv(csv_path)
    print(f"   Loaded {len(df):,} total rows.")

    # 2. Parse Date & Feature Engineering
    print("\n2. Extracting temporal features & preprocessing...")
    df['date'] = pd.to_datetime(df['date'])
    df['hour'] = df['date'].dt.hour
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    # Clean missing values if any
    df = df.dropna().reset_index(drop=True)

    # 3. Label Encoders
    encoders = {}
    categorical_cols = ['main', 'description']
    for col in categorical_cols:
        le = LabelEncoder()
        df[col + '_encoded'] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    # Define Feature Sets
    # Weather features for predicting electricity demand (active_power)
    demand_features = [
        'hour', 'day_of_week', 'month', 'day', 'is_weekend',
        'temp', 'feels_like', 'temp_min', 'temp_max', 
        'pressure', 'humidity', 'speed', 'deg', 'main_encoded'
    ]

    # Features for predicting future temperature (temp_t+1)
    weather_forecast_features = [
        'hour', 'day_of_week', 'month', 'is_weekend',
        'temp', 'feels_like', 'pressure', 'humidity', 'speed', 'deg', 'main_encoded'
    ]

    X_demand = df[demand_features]
    y_demand = df['active_power']

    X_weather = df[weather_forecast_features]
    y_temp_t1 = df['temp_t+1']
    y_feels_t1 = df['feels_like_t+1']

    # Subsample if dataset is very large for fast & high-performance training
    sample_size = min(200000, len(df))
    print(f"\n3. Subsampling {sample_size:,} records for model fitting...")
    
    idx = np.random.RandomState(42).choice(len(df), size=sample_size, replace=False)
    X_demand_sub = X_demand.iloc[idx]
    y_demand_sub = y_demand.iloc[idx]

    X_weather_sub = X_weather.iloc[idx]
    y_temp_t1_sub = y_temp_t1.iloc[idx]
    y_feels_t1_sub = y_feels_t1.iloc[idx]

    # Split Train / Test
    X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(
        X_demand_sub, y_demand_sub, test_size=0.2, random_state=42
    )

    X_train_w, X_test_w, y_train_w, y_test_w = train_test_split(
        X_weather_sub, y_temp_t1_sub, test_size=0.2, random_state=42
    )

    # 4. Train Weather-Aware Electricity Demand Model
    print("\n4. Training Weather-Aware Demand XGBoost Regressor...")
    model_demand = XGBRegressor(
        n_estimators=200,
        max_depth=7,
        learning_rate=0.08,
        random_state=42,
        n_jobs=-1
    )
    model_demand.fit(X_train_d, y_train_d)

    preds_d = model_demand.predict(X_test_d)
    mae_d = mean_absolute_error(y_test_d, preds_d)
    r2_d = r2_score(y_test_d, preds_d)
    print(f"   [Demand Model] Test MAE: {mae_d:.2f} W | R2 Score: {r2_d:.4f}")

    # 5. Train Weather Forecast Model (Predicts Future Temperature temp_t+1)
    print("\n5. Training Temperature Forecast XGBoost Regressor...")
    model_weather = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.08,
        random_state=42,
        n_jobs=-1
    )
    model_weather.fit(X_train_w, y_train_w)

    preds_w = model_weather.predict(X_test_w)
    mae_w = mean_absolute_error(y_test_w, preds_w)
    r2_w = r2_score(y_test_w, preds_w)
    print(f"   [Weather Model] Test MAE: {mae_w:.2f} °C | R2 Score: {r2_w:.4f}")

    # 6. Save Artifacts to models/
    os.makedirs("models", exist_ok=True)
    
    with open("models/weather_demand_model.pkl", "wb") as f:
        pickle.dump(model_demand, f)

    with open("models/weather_forecast_model.pkl", "wb") as f:
        pickle.dump(model_weather, f)

    with open("models/weather_encoders.pkl", "wb") as f:
        pickle.dump(encoders, f)

    with open("models/weather_feature_names.pkl", "wb") as f:
        pickle.dump({
            "demand_features": demand_features,
            "weather_features": weather_forecast_features
        }, f)

    print("\n" + "=" * 60)
    print("SUCCESS: Trained and saved all models to cist_backend/models/:")
    print("  - models/weather_demand_model.pkl")
    print("  - models/weather_forecast_model.pkl")
    print("  - models/weather_encoders.pkl")
    print("  - models/weather_feature_names.pkl")
    print("=" * 60)

if __name__ == "__main__":
    train_weather_models()
