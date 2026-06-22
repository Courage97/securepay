"""
Visualize ML model performance with charts
Creates professional images for project documentation
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import joblib

# Set style for professional-looking plots
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

def load_model_and_data():
    """Load trained model and test data"""
    print("Loading model and data...")
    
    # Load model and scaler
    model = joblib.load('ml_engine/pharming_model.pkl')
    scaler = joblib.load('ml_engine/scaler.pkl')
    
    # Load data
    df = pd.read_csv('ml_engine/training_data.csv')
    
    feature_names = [
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
    
    # Prepare test data
    X = df[feature_names]
    y = df['risk_level']
    
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)
    
    return model, y_test, y_pred, feature_names


def plot_confusion_matrix(y_test, y_pred, save_path='ml_engine/confusion_matrix.png'):
    """Create and save confusion matrix visualization"""
    print("\n📊 Creating Confusion Matrix...")
    
    # Calculate confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Create figure
    plt.figure(figsize=(10, 8))
    
    # Create heatmap
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Low Risk', 'Medium Risk', 'High Risk'],
                yticklabels=['Low Risk', 'Medium Risk', 'High Risk'],
                cbar_kws={'label': 'Number of Predictions'},
                annot_kws={'size': 16, 'weight': 'bold'})
    
    plt.title('Confusion Matrix - Pharming Detection Model', 
              fontsize=18, fontweight='bold', pad=20)
    plt.ylabel('Actual Risk Level', fontsize=14, fontweight='bold')
    plt.xlabel('Predicted Risk Level', fontsize=14, fontweight='bold')
    
    # Add accuracy text
    accuracy = np.trace(cm) / np.sum(cm) * 100
    plt.text(1.5, -0.3, f'Overall Accuracy: {accuracy:.2f}%', 
             fontsize=12, ha='center', 
             bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.5))
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Confusion matrix saved to: {save_path}")
    
    return cm


def plot_feature_importance(model, feature_names, save_path='ml_engine/feature_importance.png'):
    """Create and save feature importance chart"""
    print("\n📊 Creating Feature Importance Chart...")
    
    # Get feature importance
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    # Create figure
    plt.figure(figsize=(12, 6))
    
    # Create bar plot
    colors = sns.color_palette("rocket", len(feature_names))
    bars = plt.barh(range(len(feature_names)), 
                    importances[indices], 
                    color=colors)
    
    # Customize
    plt.yticks(range(len(feature_names)), 
               [feature_names[i].replace('_', ' ').title() for i in indices])
    plt.xlabel('Importance Score', fontsize=12, fontweight='bold')
    plt.ylabel('Features', fontsize=12, fontweight='bold')
    plt.title('Feature Importance - What the Model Considers Most', 
              fontsize=16, fontweight='bold', pad=20)
    
    # Add value labels on bars
    for i, (bar, importance) in enumerate(zip(bars, importances[indices])):
        plt.text(importance + 0.005, bar.get_y() + bar.get_height()/2, 
                f'{importance:.4f}', 
                va='center', fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Feature importance chart saved to: {save_path}")


def plot_risk_distribution(save_path='ml_engine/risk_distribution.png'):
    """Create risk level distribution chart"""
    print("\n📊 Creating Risk Distribution Chart...")
    
    df = pd.read_csv('ml_engine/training_data.csv')
    
    # Count each risk level
    risk_counts = df['risk_level'].value_counts().sort_index()
    
    # Create figure
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Pie chart
    colors = ['#90EE90', '#FFD700', '#FF6347']
    labels = ['Low Risk\n(Legitimate)', 'Medium Risk\n(Suspicious)', 'High Risk\n(Pharming)']
    explode = (0.05, 0.05, 0.1)
    
    ax1.pie(risk_counts, labels=labels, autopct='%1.1f%%', 
            colors=colors, explode=explode, shadow=True,
            textprops={'fontsize': 12, 'fontweight': 'bold'})
    ax1.set_title('Risk Level Distribution', fontsize=14, fontweight='bold', pad=20)
    
    # Bar chart
    bars = ax2.bar(['Low Risk', 'Medium Risk', 'High Risk'], 
                   risk_counts, color=colors, edgecolor='black', linewidth=2)
    ax2.set_ylabel('Number of Samples', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Risk Level', fontsize=12, fontweight='bold')
    ax2.set_title('Sample Distribution by Risk Level', fontsize=14, fontweight='bold', pad=20)
    ax2.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Risk distribution chart saved to: {save_path}")


def plot_model_performance(y_test, y_pred, save_path='ml_engine/model_performance.png'):
    """Create detailed performance metrics visualization"""
    print("\n📊 Creating Model Performance Chart...")
    
    from sklearn.metrics import precision_score, recall_score, f1_score
    
    # Calculate metrics for each class
    classes = ['Low Risk', 'Medium Risk', 'High Risk']
    precision = precision_score(y_test, y_pred, average=None, zero_division=0)
    recall = recall_score(y_test, y_pred, average=None, zero_division=0)
    f1 = f1_score(y_test, y_pred, average=None, zero_division=0)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(classes))
    width = 0.25
    
    # Create grouped bars
    bars1 = ax.bar(x - width, precision, width, label='Precision', 
                   color='#3498db', edgecolor='black', linewidth=1.5)
    bars2 = ax.bar(x, recall, width, label='Recall', 
                   color='#2ecc71', edgecolor='black', linewidth=1.5)
    bars3 = ax.bar(x + width, f1, width, label='F1-Score', 
                   color='#e74c3c', edgecolor='black', linewidth=1.5)
    
    # Customize
    ax.set_xlabel('Risk Categories', fontsize=13, fontweight='bold')
    ax.set_ylabel('Score', fontsize=13, fontweight='bold')
    ax.set_title('Model Performance Metrics by Risk Level', 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(classes, fontsize=11)
    ax.legend(fontsize=11, loc='upper right')
    ax.set_ylim(0, 1.1)
    ax.grid(axis='y', alpha=0.3)
    
    # Add value labels on bars
    def add_labels(bars):
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.02,
                   f'{height:.2f}',
                   ha='center', va='bottom', fontsize=9, fontweight='bold')
    
    add_labels(bars1)
    add_labels(bars2)
    add_labels(bars3)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✅ Model performance chart saved to: {save_path}")


def main():
    """Generate all visualizations"""
    print("=" * 70)
    print("   SECUREPAY ML MODEL VISUALIZATION")
    print("=" * 70)
    
    # Load model and data
    model, y_test, y_pred, feature_names = load_model_and_data()
    
    # Generate all plots
    plot_confusion_matrix(y_test, y_pred)
    plot_feature_importance(model, feature_names)
    plot_risk_distribution()
    plot_model_performance(y_test, y_pred)
    
    print("\n" + "=" * 70)
    print("   ALL VISUALIZATIONS CREATED SUCCESSFULLY!")
    print("=" * 70)
    print("\nGenerated files:")
    print("   1. ml_engine/confusion_matrix.png")
    print("   2. ml_engine/feature_importance.png")
    print("   3. ml_engine/risk_distribution.png")
    print("   4. ml_engine/model_performance.png")
    print("\n✅ Ready for project documentation and presentation!")


if __name__ == '__main__':
    main()