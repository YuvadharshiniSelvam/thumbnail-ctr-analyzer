import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    
    # Generate random features
    brightness = np.random.uniform(50, 220, num_samples)
    contrast = np.random.uniform(10, 90, num_samples)
    face_detected = np.random.randint(0, 2, num_samples)
    color_richness = np.random.randint(1, 6, num_samples)
    saturation = np.random.uniform(30, 200, num_samples)
    edge_density = np.random.uniform(0.01, 0.15, num_samples)
    text_present = np.random.randint(0, 2, num_samples)
    
    data = pd.DataFrame({
        'brightness': brightness,
        'contrast': contrast,
        'face_detected': face_detected,
        'color_richness': color_richness,
        'saturation': saturation,
        'edge_density': edge_density,
        'text_present': text_present
    })
    
    # Apply enhanced labeling logic for better accuracy
    def assign_label(row):
        score = 0
        if row['brightness'] > 120: score += 1
        if row['contrast'] > 50: score += 1
        if row['face_detected'] == 1: score += 1
        if row['text_present'] == 1: score += 1
        if row['saturation'] > 100: score += 1
        if 0.03 < row['edge_density'] < 0.10: score += 1 # Sweet spot for clutter
        
        # Super high CTR usually has bright faces, text, and good contrast
        if score >= 5 and row['face_detected'] == 1 and row['text_present'] == 1:
            return 'High'
        elif score <= 2:
            return 'Low'
        else:
            return 'Medium'
            
    data['label'] = data.apply(assign_label, axis=1)
    
    return data

def train_and_save_model():
    print("Generating enhanced synthetic data...")
    df = generate_synthetic_data(2000)
    
    print(f"Class distribution:\n{df['label'].value_counts()}")
    
    # Make sure feature order matches features.py return order
    X = df[['brightness', 'contrast', 'face_detected', 'color_richness', 'saturation', 'edge_density', 'text_present']]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=200, max_depth=7, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.2f}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(clf, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()
