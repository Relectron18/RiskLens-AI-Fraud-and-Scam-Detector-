from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import asyncio
import time

from ml_engine import load_model, predict_ml_probability

# ---------- APP ----------

app = FastAPI(title="RiskLens Fraud Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LOAD ML ----------

load_model()

# ---------- INPUT MODEL ----------

class TransactionInput(BaseModel):
    amount: float
    location: str
    merchant_type: str

# ---------- CONFIG ----------

HIGH_RISK_KEYWORDS = {
    "crypto": 0.30,
    "token": 0.25,
    "casino": 0.45,
    "gambling": 0.50,
    "nft": 0.40,
    "mixer": 0.60,
    "darknet": 0.70,
    "gold": 0.25,
    "jewelry": 0.30,
}

TRUSTED_LOCATIONS = ["india", "usa", "uk", "germany", "canada"]
HIGH_RISK_LOCATIONS = ["north korea", "iran", "russia", "nigeria"]

# ---------- HELPERS ----------

def merchant_vectorize(merchant: str):
    """
    Simple semantic encoding for ML input
    """
    merchant = merchant.lower()
    return [
        1 if "crypto" in merchant else 0,
        1 if "casino" in merchant else 0,
        1 if "gold" in merchant else 0,
        1 if "nft" in merchant else 0,
        1 if "food" in merchant else 0,
    ]

# ---------- RULE ENGINE ----------

def rule_engine(amount: float, location: str, merchant: str):
    score = 0.05
    reasons = []

    # Amount (PRIMARY)
    if amount > 50000:
        score += 0.45
        reasons.append("Extremely high transaction value")
    elif amount > 10000:
        score += 0.30
        reasons.append("High transaction value")
    elif amount > 3000:
        score += 0.15
        reasons.append("Moderately high transaction amount")

    # Merchant (PRIMARY)
    for key, weight in HIGH_RISK_KEYWORDS.items():
        if key in merchant.lower():
            score += weight
            reasons.append(f"High-risk merchant category: {key}")
            break

    # Natural variation (prevents identical outputs)
    score += random.uniform(-0.03, 0.03)

    # Location as MODIFIER (NOT DECIDER)
    loc = location.lower()

    if loc in HIGH_RISK_LOCATIONS:
        score *= 1.15
        reasons.append("Transaction from high-risk jurisdiction")

    if loc in TRUSTED_LOCATIONS:
        score *= 0.85
        reasons.append("Trusted transaction jurisdiction")

    score = min(max(score, 0.01), 0.99)
    return score, reasons

# ---------- ANALYZE API ----------

@app.post("/analyze")
def analyze(tx: TransactionInput):
    rule_score, reasons = rule_engine(
        tx.amount, tx.location, tx.merchant_type
    )

    ml_prob = predict_ml_probability(
        tx.amount,
        merchant_vectorize(tx.merchant_type)
    )

    if ml_prob is not None:
        final_score = 0.65 * ml_prob + 0.35 * rule_score
        reasons.insert(0, f"ML anomaly confidence: {round(ml_prob * 100)}%")
    else:
        final_score = rule_score
        reasons.insert(0, "ML unavailable — heuristic analysis applied")

    if final_score >= 0.80:
        level = "Fraud"
    elif final_score >= 0.55:
        level = "Suspicious"
    else:
        level = "Normal"

    confidence = round(0.6 + final_score * 0.4, 2)

    return {
        "risk_level": level,
        "risk_score": round(final_score, 2),
        "confidence": confidence,
        "reasons": reasons[:4],
    }

# ---------- WEBSOCKET (LIVE TABLE) ----------

@app.websocket("/ws/stream")
async def stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            await asyncio.sleep(2)
            await ws.send_json({
                "id": hex(random.randint(10000, 99999))[2:],
                "merchant": random.choice([
                    "Crypto Token Swap",
                    "Gold Exchange",
                    "NFT Marketplace",
                    "Electronics Store",
                    "Online Casino",
                    "Pharmacy Purchase"
                ]),
                "amount": random.choice([300, 1500, 9000, 42000]),
                "risk": random.choice(["Normal", "Suspicious", "Fraud"]),
                "time": time.strftime("%H:%M:%S")
            })
    except:
        await ws.close()

# ---------- HEALTH ----------

@app.get("/")
def health():
    return {"status": "online"}