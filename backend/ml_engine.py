import joblib
import numpy as np

MODEL = None

def load_model(path="model.pkl"):
    global MODEL
    try:
        MODEL = joblib.load(path)
        print("✅ ML model loaded successfully")
    except Exception as e:
        print("⚠️ ML model unavailable, using heuristic engine:", e)
        MODEL = None

def predict_ml_probability(amount: float, merchant_vector: list[int]):
    """
    Returns probability of fraud between 0 and 1, or None if ML unavailable
    """
    if MODEL is None:
        return None

    try:
        X = np.array([[amount] + merchant_vector])
        return float(MODEL.predict_proba(X)[0][1])
    except Exception:
        return None