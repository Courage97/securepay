# SecurePay 🔐
### AI-Powered Pharming Attack Prevention System

A full-stack fintech application with machine learning-powered fraud detection, adaptive multi-factor authentication, and real-time security monitoring.

![Django](https://img.shields.io/badge/Django-6.0.3-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Python](https://img.shields.io/badge/Python-3.13-yellow)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.9-blue)
![License](https://img.shields.io/badge/License-MIT-red)

---

## 📋 TABLE OF CONTENTS

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [ML Model](#ml-model)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Developer](#developer)

---

## 🌟 OVERVIEW

SecurePay is an AI-powered peer-to-peer payment platform that protects users from pharming attacks using machine learning. The system analyzes login behavior in real-time, assigns a risk score (0-100), and triggers adaptive multi-factor authentication for suspicious activity.

### What is Pharming?
Pharming attacks redirect users to fake websites that look identical to banking sites. Even with stolen passwords, SecurePay's AI detects suspicious patterns and blocks unauthorized access.

---

## ✨ FEATURES

### 🔐 Security Features
- **ML Risk Assessment** - Random Forest model analyzes 10+ security factors
- **Adaptive MFA** - Low risk = instant access, High risk = OTP verification
- **Email OTP** - 6-digit code sent to registered email
- **SMS OTP** - 6-digit code sent via Twilio (optional)
- **Device Fingerprinting** - Recognizes trusted devices
- **Login Activity Log** - Complete history of all login attempts
- **Real-time Risk Scoring** - 0-100 score with Low/Medium/High levels

### 💸 Payment Features
- **Wallet System** - Digital wallet with balance management
- **P2P Transfers** - Send money to other users instantly
- **Transaction MFA** - High-risk transactions require verification
- **Transaction History** - Last 20 transactions displayed
- **Add Funds** - Top up wallet balance

### 👤 User Features
- **Registration** - Create account with unique account number
- **Profile Management** - Edit email, phone number
- **Password Reset** - Email-based password recovery

### 📊 Admin Features
- **Admin Dashboard** - System-wide monitoring
- **User Management** - View all users and balances
- **Transaction Monitor** - All transfers with risk scores
- **Security Analytics** - Risk distribution charts

---

## 🛠️ TECH STACK

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Django | 6.0.3 | Web framework |
| Django REST Framework | 3.15+ | API development |
| PostgreSQL | 17.9 | Database |
| Simple JWT | Latest | Authentication |
| scikit-learn | Latest | ML model |
| Twilio | Latest | SMS OTP |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.0 | React framework |
| Tailwind CSS | v4 | Styling |
| React | 18+ | UI library |

### ML Model
| Component | Detail |
|-----------|--------|
| Algorithm | Random Forest Classifier |
| Accuracy | 85% |
| Features | 10 security features |
| Risk Levels | Low (0-29), Medium (30-69), High (70-100) |

---

## 📋 PREREQUISITES

Make sure you have these installed:

- **Python** 3.10+ → https://www.python.org/downloads/
- **Node.js** 18+ → https://nodejs.org/
- **PostgreSQL** 14+ → https://www.postgresql.org/download/
- **Git** → https://git-scm.com/downloads

---

## 🚀 INSTALLATION

### 1. Clone the Repository

```bash
git clone https://github.com/Courage97/securepay.git
cd securepay
```

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 3. Database Setup

Open PostgreSQL shell and run:

```sql
CREATE DATABASE securepay_db;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securepay_db TO postgres;
```

---

### 4. Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
notepad .env   # Windows
nano .env      # Mac/Linux
```

Fill in your values (see Configuration section below).

---

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 6. Train ML Model

```bash
python manage.py shell
```

```python
from api.ml_model import MLRiskAssessment
ml = MLRiskAssessment()
ml.train_model()
exit()
```

---

### 7. Create Superuser (Admin Access)

```bash
python manage.py createsuperuser
```

Then make them a superuser in shell:

```bash
python manage.py shell
```

```python
from api.models import User
user = User.objects.get(username='your_username')
user.is_superuser = True
user.is_staff = True
user.save()
exit()
```

---

### 8. Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install
```

---

## ⚙️ CONFIGURATION

### Environment Variables (.env)

```env
# Django
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=securepay_db
DB_USER=postgres
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_PORT=5432

# Email (Option A: Console - for testing)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=SecurePay <your_email@gmail.com>

# Email (Option B: Gmail SMTP - for production)
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=465
# EMAIL_USE_SSL=True
# EMAIL_HOST_USER=your_email@gmail.com
# EMAIL_HOST_PASSWORD=your_16_char_app_password

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Email Setup Options

**Option A: Console Backend (Testing - No Setup Required)**
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
OTP codes will print in the Django terminal.

**Option B: Gmail SMTP (Production)**
1. Go to https://myaccount.google.com/apppasswords
2. Create app password for "SecurePay"
3. Use the 16-character password (no spaces)

**Option C: SendGrid (Recommended for Production)**
```bash
pip install sendgrid
```
```python
EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = 'your_sendgrid_api_key'
```

### SMS Setup (Optional)
1. Create free account at https://www.twilio.com
2. Get Account SID, Auth Token, and trial phone number
3. For trial accounts, verify recipient numbers at:
   https://console.twilio.com/us1/develop/phone-numbers/manage/verified
4. Add credentials to `.env`

---

## 🏃 RUNNING THE APPLICATION

### Start Backend

```bash
cd backend
venv\Scripts\activate   # Windows
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

### Access Points

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/login | User login |
| http://localhost:3000/register | New registration |
| http://localhost:3000/dashboard | User dashboard |
| http://localhost:3000/profile | User profile |
| http://localhost:3000/login-activity | Login history |
| http://localhost:3000/admin | Admin dashboard |
| http://127.0.0.1:8000/admin | Django admin panel |

---

## 📡 API ENDPOINTS

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/` | Create new account | No |
| POST | `/api/auth/login/` | Login with risk assessment | No |
| POST | `/api/auth/verify-mfa/` | Verify OTP code | No |
| POST | `/api/auth/resend-otp/` | Resend OTP code | No |
| GET | `/api/auth/profile/` | Get user profile | Yes |
| PUT | `/api/auth/profile/` | Update profile | Yes |
| POST | `/api/auth/forgot-password/` | Request password reset | No |
| POST | `/api/auth/reset-password/` | Reset password | No |
| GET | `/api/auth/login-history/` | Get login history | Yes |

### Transactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transactions/send/` | Send money | Yes |
| POST | `/api/transactions/verify-mfa/` | Verify transaction OTP | Yes |
| GET | `/api/transactions/history/` | Transaction history | Yes |
| POST | `/api/transactions/add-funds/` | Add funds to wallet | Yes |

### Admin (Superuser only)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard/` | System statistics | Superuser |
| GET | `/api/admin/users/` | All users | Superuser |
| GET | `/api/admin/transactions/` | All transactions | Superuser |

---

## 🤖 ML MODEL

### Features Used
| Feature | Description |
|---------|-------------|
| Failed Attempts | Recent failed login count |
| Device Trust Score | Known vs unknown device (0-1) |
| IP Distance | Distance from usual location (km) |
| Login Hour | Hour of day (0-23) |
| Account Age | Days since registration |
| Transaction Velocity | Recent transaction count |
| New Receiver | First time sending to recipient |
| Large Amount | Transaction > ₦50,000 |
| IP Reputation | Known bad IP addresses |
| User Agent | Browser/device type |

### Risk Scoring
| Score | Level | Color | Action |
|-------|-------|-------|--------|
| 0-29 | Low | 🟢 Green | Direct access granted |
| 30-69 | Medium | 🟡 Yellow | Email/SMS OTP required |
| 70-100 | High | 🔴 Red | Email/SMS OTP + Security alert |

### Risk Boosting Rules
- 5+ failed attempts → Force score to max(score, 90)
- 3+ failed attempts → Force score to max(score, 60)
- 1+ failed attempts → Add 20 points
- Unknown device → Add 15 points
- Location > 100km away → Add 20 points
- Login between 12AM-6AM → Add 10 points

---

## 📁 PROJECT STRUCTURE

```
securepay/
├── backend/
│   ├── api/
│   │   ├── migrations/         # Database migrations
│   │   ├── models.py           # Database models (7 models)
│   │   ├── views.py            # API endpoints (14 endpoints)
│   │   ├── urls.py             # URL routing
│   │   ├── serializers.py      # Data serialization
│   │   ├── ml_model.py         # ML risk assessment
│   │   └── admin.py            # Admin configuration
│   ├── securepay_backend/
│   │   ├── settings.py         # Django settings
│   │   └── urls.py             # Root URL config
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   ├── .gitignore
│   └── manage.py
│
├── frontend/
│   ├── app/
│   │   ├── page.js             # Landing page (/)
│   │   ├── layout.js           # Root layout
│   │   ├── globals.css         # Global styles + Tailwind v4
│   │   ├── login/page.js       # Login with risk display
│   │   ├── register/page.js    # User registration
│   │   ├── verify-mfa/page.js  # MFA verification
│   │   ├── verify-transaction/ # Transaction MFA
│   │   ├── dashboard/page.js   # User dashboard
│   │   ├── profile/page.js     # User profile
│   │   ├── login-activity/     # Login history
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset form
│   │   └── admin/page.js       # Admin dashboard
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── next.config.js
│
└── README.md
```

### Database Models
| Model | Purpose |
|-------|---------|
| User | Custom user with wallet and account number |
| LoginAttempt | Every login attempt with risk data |
| OTPVerification | OTP codes for MFA |
| PasswordResetToken | Password reset tokens |
| TrustedDevice | Known/trusted devices per user |
| TrustedLocation | Known/trusted locations per user |
| Transaction | All money transfers |

---

## 🔧 TROUBLESHOOTING

### 1. Database Connection Error
```bash
# Check PostgreSQL is running
# Verify credentials in .env match your PostgreSQL setup
python manage.py dbshell  # Test connection
```

### 2. ML Model Not Found
```bash
python manage.py shell
from api.ml_model import MLRiskAssessment
ml = MLRiskAssessment()
ml.train_model()
exit()
```

### 3. Email Not Sending
```python
# Use console backend for testing
# In settings.py:
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# OTP will appear in Django terminal
```

### 4. CORS Errors in Browser
```python
# In settings.py, make sure you have:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 5. JWT Token Expired
```bash
# Logout and login again in the browser
# Or increase token lifetime in settings.py:
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
}
```

### 6. Twilio SMS Not Working (Trial Account)
```
Trial accounts can only send SMS to verified numbers.
Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
Add and verify the recipient's phone number.
```

### 7. OTP Says "Expired" Too Quickly
```python
# Check OTPVerification model's is_valid() method
# Make sure expires_at is being set correctly:
expires_at=timezone.now() + timedelta(minutes=10)
```

---

## 🧪 TESTING THE SYSTEM

### Test Risk Scenarios

**Low Risk Login:**
- Login from the same device multiple times
- Expected: Risk score < 30, direct access

**Medium Risk Login:**
- Login from a new browser or device
- Expected: Risk score 30-69, OTP required

**High Risk Login:**
- Make 3+ failed attempts then login
- Expected: Risk score 70+, OTP required

### Test Transactions

**Low Risk Transaction:**
- Send < ₦50,000 to a known recipient
- Expected: Instant transfer

**High Risk Transaction:**
- Send > ₦50,000 to a new recipient
- Expected: OTP verification required

---

## 🚀 DEPLOYMENT

### Backend (Railway)
1. Create account at https://railway.app
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel
```

### Important for Production
```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'your-railway-url.railway.app']

# Use real email backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
```

---

## 👨‍💻 DEVELOPER

**Barnabas Oyewole**
- GitHub: [@Courage97](https://github.com/Courage97)
- Email: oyewolebarnabas97@gmail.com
- Phone: +234 8062794852
- Brand: [Courage World Academy](https://github.com/Courage97)

---

## 📄 LICENSE

This project is licensed under the MIT License.

---

## 🙏 ACKNOWLEDGMENTS

- Django REST Framework
- Next.js by Vercel
- scikit-learn
- Twilio
- Tailwind CSS v4

---

*Built with ❤️ by Courage World Academy
 | SecurePay - Protecting Your Money with AI* 🔐