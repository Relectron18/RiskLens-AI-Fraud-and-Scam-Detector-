from risk_lens_ml import RiskEngine
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, roc_auc_score
import pandas as pd

def run_analytics():
    print("Loading Engine and Model...")
    engine = RiskEngine()
    engine.load_model()

    print(f"Loading Data... (Threshold: {engine.optimal_threshold:.4f})")
    try:
        df = engine.load_kaggle_data()
    except FileNotFoundError:
        print("Error: Could not find data/creditcard.csv")
        return

    X = df[engine.feature_columns]
    y = df['Class']

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Running predictions on {len(X_test)} test transactions...")
    y_pred_proba = engine.model.predict_proba(X_test)[:, 1]
    
    y_pred = (y_pred_proba >= engine.optimal_threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    roc_score = roc_auc_score(y_test, y_pred_proba)

    print("\n" + "="*40)
    print("       PERFORMANCE REPORT       ")
    print("="*40)
    
    print(f"\nTOTAL FRAUDS IN TEST SET:  {tp + fn}")
    print(f"✅ CAUGHT FRAUDS:           {tp}  (True Positives)")
    print(f"❌ MISSED FRAUDS:           {fn}  (False Negatives)")
    
    print("-" * 40)
    
    print(f"\nTOTAL NORMAL TRANSFERS:    {tn + fp}")
    print(f"✅ CORRECTLY ALLOWED:       {tn}  (True Negatives)")
    print(f"⚠️ FALSE ALARMS:            {fp}  (False Positives)")
    
    fpr = (fp / (tn + fp)) * 100
    print(f"   False Positive Rate:     {fpr:.4f}% (Lower is better)")

    print("="*40)
    
    recall = (tp / (tp + fn)) * 100
    precision = (tp / (tp + fp)) * 100
    
    print(f"\nSUCCESS RATE (Recall):     {recall:.2f}% of all frauds caught")
    print(f"PRECISION:                 {precision:.2f}% of alerts were real fraud")
    print(f"ROC AUC SCORE:             {roc_score:.4f} (1.0 is perfect)")
    
    print("\n" + "="*40)
    print("       FINANCIAL IMPACT (EST.)       ")
    print("="*40)
    
    cost_missed = 500
    cost_false_alarm = 5
    
    baseline_loss = (tp + fn) * cost_missed
    
    model_loss = (fn * cost_missed) + (fp * cost_false_alarm)
    
    savings = baseline_loss - model_loss
    
    print(f"Avg Fraud Cost: ${cost_missed} | Avg False Alarm Cost: ${cost_false_alarm}")
    print("-" * 40)
    print(f"🚫 Loss w/o AI:           ${baseline_loss:,.2f}")
    print(f"🤖 Loss w/ RiskLens:      ${model_loss:,.2f}")
    print(f"💰 TOTAL SAVINGS:         ${savings:,.2f}")
    print("="*40 + "\n")

if __name__ == "__main__":
    run_analytics()