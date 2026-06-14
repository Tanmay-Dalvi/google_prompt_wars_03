# 🌍 EcoSense — Carbon Footprint Awareness Platform

> Track your impact. Save the planet. One decision at a time.

EcoSense is a full-stack carbon footprint tracking and awareness platform built to empower individuals to make sustainable choices. Using AI-powered insights, real-time gamified visualizations, and community challenges, EcoSense transforms environmental awareness into an engaging daily practice.

[![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Built with FastAPI](https://img.shields.io/badge/Built%20with-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Built with Firebase](https://img.shields.io/badge/Built%20with-Firebase-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![AI powered by Gemini](https://img.shields.io/badge/AI%20powered%20by-Gemini-1a73e8?style=flat-square&logo=googlegemini)](https://deepmind.google/technologies/gemini)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

🔗 **Live Demo**: [EcoSense Hackathon Submission](https://ecosense.vercel.app)

---

## 📸 Screenshots

*Screenshot placeholders — replace with your actual platform captures!*

| Home Landing Page | User Carbon Dashboard |
| :---: | :---: |
| ![Home Screenshot](https://placehold.co/600x400/0a0f0a/22c55e?text=EcoSense+Home+Page) | ![Dashboard Screenshot](https://placehold.co/600x400/0a0f0a/22c55e?text=EcoSense+Dashboard) |

| Global Leaderboard | User Profile & Badges |
| :---: | :---: |
| ![Leaderboard Screenshot](https://placehold.co/600x400/0a0f0a/22c55e?text=Standings+Leaderboard) | ![Profile Screenshot](https://placehold.co/600x400/0a0f0a/22c55e?text=Profile+and+Google+Charts) |

---

## ✨ Features

1. **🧮 Carbon Footprint Calculator**: Multi-step wizard collecting weekly/monthly habits (transport, food, energy, shopping) and calculating carbon emissions against India's average.
2. **🤖 AI-Powered Insights**: Google Gemini analyzes your carbon logs and suggests 5 personalized eco-tips and a "Quick Win" action.
3. **🌍 Gamified World Visualizer**: An animated SVG planet that heals in real-time as your score improves — smog clears, trees grow, and animals (deer, rabbits, birds) return!
4. **🏆 Community Leaderboard**: Compare scores globally, filter by Weekly, Monthly, or All-Time periods, and view podium standings.
5. **🎯 Sustainability Challenges**: Join active challenges (e.g. Meatless Mondays, Cycle to Work), track days remaining, and mark them complete to gain points.
6. **📰 Gemini Eco News Feed**: Live news-style feed showing AI-generated or fallback environmental updates and daily actions.
7. **⚙️ Monthly Targets & Toggles**: Custom monthly carbon target slider (0-200 kg) with opt-ins for public leaderboard listings and email nudges.

---

## 🛠️ Tech Stack & Services

### Technology Grid
| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + Vite + Tailwind CSS | Component architecture, styling, and SPA builds |
| **Backend** | FastAPI (Python 3.11) | High-performance asynchronous API endpoints |
| **Google Services** | Firebase Auth / Firestore / Analytics | Authentication, database persistence, and event tracking |
| **AI Layer** | Google Gemini API (`gemini-1.5-flash`) | Structured insight generation and custom eco news |

### 💚 Google Services Used
- **Firebase Authentication**: Seamless Google Sign-In with robust fallback options.
- **Firebase Firestore**: Real-time storage for user footprints, challenges, and leaderboards.
- **Firebase Analytics**: User activity and page view event tracking.
- **Google Gemini AI**: Powering personalized carbon recommendations and news items.
- **Google Charts**: Dynamic stacked ColumnCharts, PieCharts, and BarCharts rendering user metrics.
- **Google Maps Embed API**: Local search widget pinpointing parks and green spaces near the user.
- **Google Fonts**: Custom typeface integration (`Inter` and `Nunito` font families).

---

## 🏗️ Architecture

```
                 +---------------------------------------+
                 |            React Frontend             |
                 |  (Vite + Tailwind + Google Charts/Maps|
                 +-------------------+-------------------+
                                     |
                                     |  HTTP REST / CORS
                                     v
                 +-------------------+-------------------+
                 |           FastAPI Backend             |
                 |         (Python / Uvicorn)            |
                 +----+-----------------------------+----+
                      |                             |
                      |  Firebase SDK               |  Google AI SDK
                      v                             v
           +----------+----------+        +---------+----------+
           | Firestore Database  |        |  Google Gemini AI  |
           |   & Firebase Auth   |        | (gemini-1.5-flash) |
           +---------------------+        +--------------------+
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ecosense.git
cd ecosense
```

### 2. Backend Installation (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Open .env and add your Gemini API Key and Firebase admin credentials
uvicorn main:app --reload --port 8000
```
*The backend API will run on `http://localhost:8000`.*

### 3. Frontend Installation (React)
```bash
cd ../frontend
npm install
cp .env.example .env
# Open .env and insert your Firebase app credentials and Maps keys
npm run dev
```
*The React app will run on `http://localhost:5173`.*

---

## 🔧 Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Client Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase app auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firestore project ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key (for green spaces maps) |
| `VITE_API_BASE_URL` | Backend API URL (`http://localhost:8000`) |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key |
| `FIREBASE_PROJECT_ID` | Admin project ID certificate |
| `FIREBASE_PRIVATE_KEY` | Admin Private certificate key |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service account email |
| `FRONTEND_URL` | CORS Allowed Origins URL (`http://localhost:5173`) |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
Built with 💚 for a sustainable future.
