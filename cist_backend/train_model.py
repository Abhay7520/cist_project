import pandas as pd
import pickle
import random

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_percentage_error
from xgboost import XGBRegressor

# Load dataset
df = pd.read_csv("data/TGSPDCL_Modified.csv")

# Drop missing values
df = df.dropna()

# -------------------------------
# ENCODE CATEGORICAL DATA
# -------------------------------
categorical_cols = [
    "circle", "division", "subdivision",
    "section", "area", "catdesc", "area_type", "renewable_type"
]

encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# -------------------------------
# FEATURES & TARGETS
# -------------------------------
# Common features for both models
# We exclude 'load', 'solar_generation', 'renewable_percentage', and 'catcode'
drop_cols = ["load", "solar_generation", "renewable_percentage", "catcode"]
X = df.drop(columns=drop_cols, errors="ignore")

y_demand = df["load"]
y_renewable = df["solar_generation"]

# Split for demand model
X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(
    X, y_demand, test_size=0.2, random_state=42
)

# Split for renewable model
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X, y_renewable, test_size=0.2, random_state=42
)

# -------------------------------
# TRAIN MODELS (XGBoost)
# -------------------------------
print("Training Demand Model...")
model_demand = XGBRegressor(n_estimators=150, max_depth=6)
model_demand.fit(X_train_d, y_train_d)

print("Training Renewable Model...")
model_renewable = XGBRegressor(n_estimators=150, max_depth=6)
model_renewable.fit(X_train_r, y_train_r)

# -------------------------------
# EVALUATE
# -------------------------------
preds_d = model_demand.predict(X_test_d)
mape_d = mean_absolute_percentage_error(y_test_d, preds_d)

preds_r = model_renewable.predict(X_test_r)
mape_r = mean_absolute_percentage_error(y_test_r, preds_r)

print(f"Demand Model MAPE: {mape_d:.4f}")
print(f"Renewable Model MAPE: {mape_r:.4f}")

# -------------------------------
# SAVE MODELS + ENCODERS
# -------------------------------
with open("models/demand_model.pkl", "wb") as f:
    pickle.dump(model_demand, f)

with open("models/renewable_model.pkl", "wb") as f:
    pickle.dump(model_renewable, f)

with open("models/encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)

print("Both models trained and saved!")