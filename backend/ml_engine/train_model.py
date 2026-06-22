"""
Train Random Forest model for pharming detection
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os

class PharmingDetectionModel:
    """ML Model for detecting pharming attacks"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'ip_distance_km',
            'device_trust_score',
            'time_since_last_login_hrs',
            'dns_response_time_ms',
            'ssl_cert_valid',
            'domain_age_days',
            'login_hour',
            'failed_login_attempts',
            'browser_fingerprint_match',
            'geolocation_match'
        ]
    
    def load_data(self, filepath='ml_engine/training_data.csv'):
        """Load training data"""
        print(f"Loading data from {filepath}...")
        df = pd.read_csv(filepath)
        print(f"✅ Loaded {len(df)} samples")
        return df
    
    def train(self, df):
        """Train the model"""
        print("\n🧠 Training Random Forest model...")
        
        # Prepare features and target
        X = df[self.feature_names]
        y = df['risk_level']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"   Training set: {len(X_train)} samples")
        print(f"   Test set: {len(X_test)} samples")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n✅ Model trained successfully!")
        print(f"   Accuracy: {accuracy*100:.2f}%")
        
        # Detailed metrics
        print("\n📊 Classification Report:")
        print(classification_report(y_test, y_pred, 
                                    target_names=['Low Risk', 'Medium Risk', 'High Risk']))
        
        print("\n🔍 Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        # Feature importance
        print("\n🎯 Top 5 Most Important Features:")
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        for idx, row in feature_importance.head(5).iterrows():
            print(f"   {row['feature']}: {row['importance']:.4f}")
        
        return accuracy
    
    def save_model(self, model_path='ml_engine/pharming_model.pkl', 
                   scaler_path='ml_engine/scaler.pkl'):
        """Save trained model and scaler"""
        print(f"\n💾 Saving model to {model_path}...")
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        print("✅ Model and scaler saved successfully!")
    
    def predict(self, features):
        """
        Predict risk level for new login attempt
        
        Parameters:
        -----------
        features : dict or array
            Login features
        
        Returns:
        --------
        risk_level : int (0=Low, 1=Medium, 2=High)
        risk_score : float (0-100)
        confidence : float (0-1)
        """
        # Convert dict to array if needed
        if isinstance(features, dict):
            feature_array = [features[f] for f in self.feature_names]
        else:
            feature_array = features
        
        # Scale features
        feature_scaled = self.scaler.transform([feature_array])
        
        # Predict
        risk_level = self.model.predict(feature_scaled)[0]
        probabilities = self.model.predict_proba(feature_scaled)[0]
        confidence = max(probabilities)
        
        # Convert risk level to score (0-100)
        risk_score = risk_level * 50 if risk_level < 2 else 100
        
        return int(risk_level), float(risk_score), float(confidence)


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("   SECUREPAY PHARMING DETECTION MODEL - TRAINING")
    print("=" * 60)
    
    # Initialize model
    model = PharmingDetectionModel()
    
    # Load data
    df = model.load_data()
    
    # Train
    accuracy = model.train(df)
    
    # Save
    model.save_model()
    
    print("\n" + "=" * 60)
    print("   TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n✅ Model is ready to detect pharming attacks!")
    print(f"✅ Accuracy: {accuracy*100:.2f}%")
    print(f"\nFiles created:")
    print(f"   - ml_engine/pharming_model.pkl")
    print(f"   - ml_engine/scaler.pkl")


if __name__ == '__main__':
    main()