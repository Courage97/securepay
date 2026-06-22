"""
Generate synthetic training data for pharming detection model
This simulates normal logins vs pharming attacks
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_training_data(n_samples=2000):
    """
    Generate synthetic login data
    70% legitimate, 30% suspicious/pharming attacks
    """
    
    np.random.seed(42)
    random.seed(42)
    
    # Legitimate login patterns (70%)
    n_legitimate = int(n_samples * 0.7)
    
    legitimate_data = {
        # Distance from usual location (km)
        'ip_distance_km': np.random.normal(5, 10, n_legitimate).clip(0, 100),
        
        # Device trust score (0-1)
        'device_trust_score': np.random.uniform(0.7, 1.0, n_legitimate),
        
        # Time since last login (hours)
        'time_since_last_login_hrs': np.random.exponential(24, n_legitimate).clip(0.1, 168),
        
        # DNS response time (milliseconds)
        'dns_response_time_ms': np.random.normal(20, 5, n_legitimate).clip(5, 50),
        
        # SSL certificate valid (1 = yes, 0 = no)
        'ssl_cert_valid': np.ones(n_legitimate),
        
        # Domain age (days)
        'domain_age_days': np.random.uniform(365, 3650, n_legitimate),
        
        # Login hour (0-23)
        'login_hour': np.random.choice(range(6, 23), n_legitimate),
        
        # Recent failed login attempts
        'failed_login_attempts': np.random.choice([0, 0, 0, 1], n_legitimate),
        
        # Browser fingerprint matches history (1 = yes, 0 = no)
        'browser_fingerprint_match': np.random.choice([1, 1, 1, 0], n_legitimate),
        
        # Geolocation matches usual location (1 = yes, 0 = no)
        'geolocation_match': np.random.choice([1, 1, 1, 0], n_legitimate),
        
        # Risk level: 0 = Low (legitimate)
        'risk_level': np.zeros(n_legitimate, dtype=int)
    }
    
    # Suspicious/Pharming login patterns (30%)
    n_pharming = n_samples - n_legitimate
    
    pharming_data = {
        # Far from usual location
        'ip_distance_km': np.random.uniform(500, 8000, n_pharming),
        
        # Unknown device
        'device_trust_score': np.random.uniform(0.0, 0.4, n_pharming),
        
        # Quick succession or very long gap
        'time_since_last_login_hrs': np.random.choice(
            [np.random.uniform(0.01, 2), np.random.uniform(200, 500)], 
            n_pharming
        ),
        
        # Slow/suspicious DNS
        'dns_response_time_ms': np.random.normal(150, 50, n_pharming).clip(80, 300),
        
        # Often invalid SSL
        'ssl_cert_valid': np.random.choice([0, 0, 0, 1], n_pharming),
        
        # New/suspicious domain
        'domain_age_days': np.random.uniform(1, 90, n_pharming),
        
        # Unusual hours
        'login_hour': np.random.choice(range(0, 24), n_pharming),
        
        # Multiple failed attempts
        'failed_login_attempts': np.random.choice([1, 2, 3, 4], n_pharming),
        
        # Unknown browser
        'browser_fingerprint_match': np.random.choice([0, 0, 0, 1], n_pharming),
        
        # Wrong location
        'geolocation_match': np.random.choice([0, 0, 1], n_pharming),
        
        # Risk level: 1 = Medium, 2 = High
        'risk_level': np.random.choice([1, 2], n_pharming, p=[0.4, 0.6])
    }
    
    # Combine datasets
    df_legitimate = pd.DataFrame(legitimate_data)
    df_pharming = pd.DataFrame(pharming_data)
    df = pd.concat([df_legitimate, df_pharming], ignore_index=True)
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df


if __name__ == '__main__':
    # Generate and save training data
    print("Generating training data...")
    df = generate_training_data(2000)
    
    # Save to CSV
    df.to_csv('ml_engine/training_data.csv', index=False)
    
    print(f"✅ Generated {len(df)} training samples")
    print(f"   - Legitimate (Low Risk): {(df['risk_level'] == 0).sum()}")
    print(f"   - Medium Risk: {(df['risk_level'] == 1).sum()}")
    print(f"   - High Risk (Pharming): {(df['risk_level'] == 2).sum()}")
    print(f"   - Saved to: ml_engine/training_data.csv")