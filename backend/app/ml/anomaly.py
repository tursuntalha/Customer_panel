import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "anomaly_model.pkl")

def train_anomaly_model():
    np.random.seed(42)
    X_train = np.random.randn(1000, 4)
    X_train[:20] = np.random.uniform(5, 10, (20, 4))
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X_train)
    joblib.dump(model, MODEL_PATH)
    return model

def load_anomaly_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return train_anomaly_model()

def detect_anomaly(features: list) -> dict:
    model = load_anomaly_model()
    score = model.decision_function([features])[0]
    pred = model.predict([features])[0]
    return {
        "is_anomaly": bool(pred == -1),
        "anomaly_score": round(float(score), 4)
    }
