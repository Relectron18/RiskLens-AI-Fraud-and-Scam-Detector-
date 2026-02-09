import random
import time

MERCHANT_RULES = {
    "food": ("Essential goods purchase", 0.03),
    "grocery": ("Essential goods purchase", 0.03),
    "pharmacy": ("Medical-related transaction", 0.05),
    "fuel": ("Fuel purchase", 0.06),

    "electronics": ("High resale-value merchandise", 0.18),
    "gold": ("High-value store-of-value asset", 0.28),
    "jewelry": ("Portable high-value asset", 0.32),
    "luxury": ("Luxury asset with laundering risk", 0.35),

    "crypto": ("Anonymous digital asset transfer", 0.45),
    "token": ("Blockchain-based digital token", 0.40),
    "nft": ("Speculative digital asset", 0.50),

    "casino": ("Gambling-related transaction", 0.65),
    "bet": ("Betting-related transaction", 0.60),
    "gambling": ("High-risk gambling activity", 0.65),

    "mixer": ("Transaction obfuscation service", 0.80),
    "darknet": ("Illicit marketplace activity", 0.90),
}

HIGH_RISK_LOCATIONS = {
    "north korea": ("Sanctioned jurisdiction", 0.50),
    "iran": ("Sanctioned jurisdiction", 0.45),
    "russia": ("High-risk financial region", 0.35),
    "nigeria": ("Fraud-prone region", 0.30),
}

LOW_RISK_LOCATIONS = {
    "usa": ("Low-risk jurisdiction", -0.05),
    "india": ("Low-risk jurisdiction", -0.05),
    "uk": ("Low-risk jurisdiction", -0.05),
    "germany": ("Low-risk jurisdiction", -0.05),
    "canada": ("Low-risk jurisdiction", -0.05),
}

RECENT_ACTIVITY = []

def rule_engine(amount: float, location: str, merchant: str):
    score = 0.05
    reasons = []

    m = merchant.lower()
    l = location.lower()

    # Merchant classification
    matched = False
    for key, (desc, risk) in MERCHANT_RULES.items():
        if key in m:
            score += risk
            reasons.append(desc)
            matched = True
            break

    if not matched:
        score += 0.10
        reasons.append("Unrecognized merchant behavior")

    # Amount analysis
    if amount > 50000:
        score += 0.40
        reasons.append("Extremely high transaction value")
    elif amount > 10000:
        score += 0.30
        reasons.append("Very high transaction value")
    elif amount > 3000:
        score += 0.20
        reasons.append("High transaction amount")

    # Location risk
    for k, (desc, risk) in HIGH_RISK_LOCATIONS.items():
        if k in l:
            score += risk
            reasons.append(desc)
            break

    for k, (desc, risk) in LOW_RISK_LOCATIONS.items():
        if k in l:
            score += risk
            reasons.append(desc)
            break

    # Velocity simulation
    now = time.time()
    RECENT_ACTIVITY.append(now)
    recent = len([t for t in RECENT_ACTIVITY if now - t < 60])

    if recent > 5:
        score += 0.20
        reasons.append("Unusually high transaction frequency")

    # Noise (prevents deterministic patterns)
    score += random.uniform(-0.03, 0.03)

    score = max(0.01, min(score, 0.99))

    return score, reasons