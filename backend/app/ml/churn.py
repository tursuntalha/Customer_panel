import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "churn_scaler.pkl")

def generate_synthetic_data(n=5000):
    np.random.seed(42)
    data = {
        "days_since_last_order": np.random.randint(1, 365, n),
        "order_count_90d": np.random.randint(0, 50, n),
        "total_revenue_lifetime": np.random.uniform(100, 50000, n),
        "complaint_count": np.random.randint(0, 10, n),
        "avg_order_value": np.random.uniform(20, 2000, n),
        "days_since_registration": np.random.randint(1, 2000, n),
    }
    df = pd.DataFrame(data)
    df["churn"] = (
        (df["days_since_last_order"] > 180).astype(int) * 0.4 +
        (df["order_count_90d"] < 3).astype(int) * 0.3 +
        (df["complaint_count"] > 3).astype(int) * 0.2 +
        (df["avg_order_value"] < 50).astype(int) * 0.1
    )
    df["churn"] = (df["churn"] > 0.35).astype(int)
    return df

def train_model():
    df = generate_synthetic_data()
    features = ["days_since_last_order", "order_count_90d", "total_revenue_lifetime",
                "complaint_count", "avg_order_value", "days_since_registration"]
    X = df[features]
    y = df["churn"]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    return model, scaler

def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        return joblib.load(MODEL_PATH), joblib.load(SCALER_PATH)
    return train_model()

def predict_churn(features: list) -> float:
    model, scaler = load_model()
    X = scaler.transform([features])
    proba = model.predict_proba(X)[0][1]
    return round(float(proba), 4)

def get_churn_label(probability: float) -> str:
    if probability >= 0.7:
        return "high"
    elif probability >= 0.3:
        return "medium"
    return "low"
