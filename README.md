# RiskLens AI – Fraud & Scam Detection Platform

RiskLens AI is a real-time fraud and scam detection system designed to assess transaction risk across digital payments, fintech platforms, and Web3 ecosystems. It combines machine learning, rule-based intelligence, and behavioral heuristics to deliver accurate, explainable, and actionable risk insights.

Built with a modern full-stack architecture, RiskLens AI provides both on-demand transaction analysis and a live threat stream, enabling proactive monitoring and rapid decision-making.

---

## Key Features

- **Hybrid Risk Engine**  
  Combines ML probability scoring with deterministic rules to ensure accuracy, robustness, and explainability.

- **Explainable Risk Analysis**  
  Every decision includes a detailed breakdown of contributing risk factors such as transaction amount, merchant behavior, jurisdictional risk, and velocity patterns.

- **Real-Time Threat Streaming**  
  Live WebSocket-based transaction feed with continuous risk updates.

- **Dynamic Risk Scoring (0–100)**  
  Normalized risk scores mapped to Normal, Suspicious, or Fraud classifications.

- **Modern Interactive Dashboard**  
  Futuristic UI with network health indicators, live threat tables, and animated risk visualizations.

---

## How RiskLens Works

1. Transaction data is received via REST API or WebSocket.
2. Relevant features are extracted (amount, location, merchant type, behavioral signals).
3. A trained machine learning model estimates fraud probability.
4. A rule-based engine adjusts and validates the score for edge cases and compliance scenarios.
5. A final risk score, label, and explanation are returned to the dashboard.

This hybrid design ensures system stability and explainability even when ML confidence is low or unavailable.

---

## Tech Stack

**Frontend**
- React + TypeScript
- Tailwind CSS
- WebSockets for live updates

**Backend**
- FastAPI
- Python
- WebSocket streaming
- Scikit-learn (ML model)

---

## Running the Project

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
