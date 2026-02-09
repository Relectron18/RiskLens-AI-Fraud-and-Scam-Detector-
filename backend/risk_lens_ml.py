import joblib
import logging
import numpy as np

logger = logging.getLogger("RiskLens-ML")

MODEL_PATH = "risklens_model.pkl"
_model = None


def load_model():
    global _model
    try:
        _model = joblib.load(MODEL_PATH)
        logger.info("✅ ML model loaded")
    except Exception as e:
        logger.warning(f"⚠️ ML model unavailable: {e}")
        _model = None


def extract_features(amount: float, location: str, merchant: str):
    """
    MUST roughly match training logic.
    """
    loc = location.lower()
    merch = merchant.lower()

    # Location risk encoding
    if any(x in loc for x in ["north korea", "iran"]):
        loc_score = 1.0
    elif any(x in loc for x in ["nigeria", "russia"]):
        loc_score = 0.7
    else:
        loc_score = 0.2

    # Merchant risk encoding
    if any(x in merch for x in ["crypto", "token", "nft"]):
        merch_score = 1.0
    elif any(x in merch for x in ["gold", "jewelry"]):
        merch_score = 0.6
    elif any(x in merch for x in ["food", "grocery"]):
        merch_score = 0.1
    else:
        merch_score = 0.3

    return np.array([[amount, loc_score, merch_score]])


def predict_probability(amount: float, location: str, merchant: str):
    if _model is None:
        return None

    try:
        X = extract_features(amount, location, merchant)
        prob = _model.predict_proba(X)[0][1]
        return float(prob)
    except Exception as e:
        logger.error(f"ML inference failed: {e}")
        return None