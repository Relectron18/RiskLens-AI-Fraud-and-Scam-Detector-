import asyncio
import random
import time
import logging
from typing import Optional, Dict

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --------------------------------------------------
# APP SETUP
# --------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RiskLens")

app = FastAPI(title="RiskLens – Advanced Fraud Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# DATA MODELS
# --------------------------------------------------

class TransactionInput(BaseModel):
    amount: float
    location: str
    merchant_type: str
    time: Optional[str] = None

# --------------------------------------------------
# KNOWLEDGE BASE (EXPANDED ×2)
# --------------------------------------------------

MERCHANT_CATEGORIES: Dict[str, Dict] = {
    # Essentials
    "food": {"risk": 0.02, "type": "essential", "reputation": 0.9},
    "grocery": {"risk": 0.02, "type": "essential", "reputation": 0.9},
    "pharmacy": {"risk": 0.03, "type": "essential", "reputation": 0.95},
    "fuel": {"risk": 0.06, "type": "essential", "reputation": 0.85},

    # Physical value
    "gold": {"risk": 0.22, "type": "store_of_value", "reputation": 0.7},
    "jewelry": {"risk": 0.30, "type": "store_of_value", "reputation": 0.65},
    "art": {"risk": 0.35, "type": "store_of_value", "reputation": 0.6},

    # Resale goods
    "electronics": {"risk": 0.18, "type": "resale", "reputation": 0.75},
    "luxury": {"risk": 0.32, "type": "resale", "reputation": 0.6},
    "watch": {"risk": 0.28, "type": "resale", "reputation": 0.65},

    # Digital assets
    "crypto": {"risk": 0.45, "type": "digital_asset", "reputation": 0.55},
    "token": {"risk": 0.40, "type": "digital_asset", "reputation": 0.6},
    "nft": {"risk": 0.50, "type": "digital_asset", "reputation": 0.5},
    "defi": {"risk": 0.55, "type": "digital_asset", "reputation": 0.45},

    # Vice / obfuscation
    "gambling": {"risk": 0.60, "type": "vice", "reputation": 0.4},
    "casino": {"risk": 0.65, "type": "vice", "reputation": 0.35},
    "bet": {"risk": 0.60, "type": "vice", "reputation": 0.4},
    "mixer": {"risk": 0.75, "type": "obfuscation", "reputation": 0.2},
    "darknet": {"risk": 0.85, "type": "illegal", "reputation": 0.1},
    "weapon": {"risk": 0.90, "type": "illegal", "reputation": 0.05},
}

HIGH_RISK_LOCATIONS = {
    "north korea": 0.50,
    "iran": 0.45,
    "russia": 0.35,
    "nigeria": 0.30,
    "china": 0.25,
}

LOW_RISK_LOCATIONS = {
    "usa": 0.06,
    "india": 0.05,
    "uk": 0.05,
    "germany": 0.05,
    "canada": 0.05,
    "japan": 0.04,
}

# --------------------------------------------------
# SIMULATED MEMORY (FOR BEHAVIOR)
# --------------------------------------------------

RECENT_ACTIVITY = []

# --------------------------------------------------
# CORE FRAUD ENGINE (EXPANDED)
# --------------------------------------------------

def analyze_transaction(amount: float, location: str, merchant: str):
    risk_score = 0.04
    explanations = []

    merchant_l = merchant.lower()
    location_l = location.lower()

    category = None
    meta = {}

    # ---------- MERCHANT CLASSIFICATION ----------
    for key, info in MERCHANT_CATEGORIES.items():
        if key in merchant_l:
            category = key
            meta = info
            risk_score += info["risk"]
            explanations.append(
                f"Merchant classified as {info['type']} category ({key})"
            )
            break

    if not category:
        risk_score += 0.06
        explanations.append("Unrecognized merchant pattern")

    # ---------- MERCHANT REPUTATION ----------
    reputation = meta.get("reputation", 0.5)
    reputation_penalty = (1 - reputation) * 0.25
    risk_score += reputation_penalty
    explanations.append(f"Merchant reputation score impact applied")

    # ---------- AMOUNT ANALYSIS ----------
    if amount > 100000:
        risk_score += 0.45
        explanations.append("Extremely high transaction value")
    elif amount > 25000:
        risk_score += 0.30
        explanations.append("Very high transaction amount")
    elif amount > 5000:
        risk_score += 0.20
        explanations.append("High transaction amount")
    elif amount < 100:
        risk_score -= 0.05
        explanations.append("Low-value transaction")

    # ---------- LOCATION RISK ----------
    for c, r in HIGH_RISK_LOCATIONS.items():
        if c in location_l:
            risk_score += r
            explanations.append(f"High-risk jurisdiction detected ({c})")
            break

    for c, r in LOW_RISK_LOCATIONS.items():
        if c in location_l:
            risk_score -= r
            explanations.append(f"Low-risk jurisdiction benefit ({c})")
            break

    # ---------- TIME-OF-DAY RISK ----------
    hour = int(time.strftime("%H"))
    if hour < 5 or hour > 23:
        risk_score += 0.10
        explanations.append("Unusual transaction time (late night)")

    # ---------- BEHAVIOR / VELOCITY ----------
    now = time.time()
    RECENT_ACTIVITY.append(now)
    recent_count = len([t for t in RECENT_ACTIVITY if now - t < 60])

    if recent_count > 5:
        risk_score += 0.20
        explanations.append("High transaction velocity detected")

    # ---------- CONTEXT INTERACTIONS ----------
    if meta.get("type") == "digital_asset" and amount > 2000:
        risk_score += 0.20
        explanations.append("Large digital asset transfer")

    if meta.get("type") == "essential" and amount < 500:
        risk_score -= 0.10
        explanations.append("Typical essential purchase")

    # ---------- RANDOMNESS (ANTI-DETERMINISM) ----------
    jitter = random.uniform(-0.03, 0.03)
    risk_score += jitter

    # ---------- NORMALIZATION ----------
    risk_score = max(0.01, min(risk_score, 0.99))

    # ---------- CLASSIFICATION ----------
    if risk_score > 0.82:
        level = "Fraud"
    elif risk_score > 0.55:
        level = "Suspicious"
    else:
        level = "Normal"

    confidence = round(min(0.99, 0.6 + risk_score * 0.4), 2)

    return level, round(risk_score, 2), confidence, " | ".join(explanations)

# --------------------------------------------------
# API
# --------------------------------------------------

@app.get("/")
def health():
    return {"status": "online"}

@app.post("/analyze")
async def analyze(txn: TransactionInput):
    level, score, confidence, reason = analyze_transaction(
        txn.amount, txn.location, txn.merchant_type
    )
    return {
        "risk_level": level,
        "risk_score": score,
        "confidence": confidence,
        "explanation": reason,
    }

# --------------------------------------------------
# LIVE STREAM
# --------------------------------------------------

@app.websocket("/ws/stream")
async def live_stream(ws: WebSocket):
    await ws.accept()
    logger.info("🔌 WebSocket connected")

    try:
        while True:
            await asyncio.sleep(2)

            amt = random.choice([50, 300, 1500, 9000, 42000])
            loc = random.choice(["USA", "India", "UK", "Nigeria", "Russia"])
            merch = random.choice([
                "Food Delivery",
                "Gold Exchange",
                "Crypto Token Swap",
                "NFT Marketplace",
                "Online Casino",
                "Electronics Store",
                "Pharmacy Purchase"
            ])

            level, score, conf, _ = analyze_transaction(amt, loc, merch)

            await ws.send_json({
                "amount": amt,
                "location": loc,
                "merchant": merch,
                "risk": level,
                "score": score,
                "confidence": conf,
                "time": time.strftime("%H:%M:%S"),
            })

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await ws.close()
        logger.info("🔌 WebSocket disconnected")