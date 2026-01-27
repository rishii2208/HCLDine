# Food App

A full-stack food ordering application with React frontend and Node.js/Firebase backend.

## Project Structure

```
FOOD-APP/
├── frontend/          # React + Vite app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Express + Firebase Admin
│   ├── src/
│   └── package.json
│
└── README.md
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

### Backend

```bash
cd backend
npm install
# Add serviceAccountKey.json from Firebase Console
npm run seed    # Seed database (optional)
npm start
```

Runs at http://localhost:5000

## Features

- 🔐 User Authentication (Firebase Auth)
- 🍕 Menu browsing with categories
- 🛒 Shopping cart (persisted per user)
- 📦 Order placement & tracking
- 📜 Order history

## Tech Stack

**Frontend:**

- React 19
- Vite
- React Router
- Firebase Client SDK

**Backend:**

- Node.js / Express
- Firebase Admin SDK
- Firestore Database

## Deployment

- **Frontend:** Firebase Hosting, Vercel, Netlify
- **Backend:** Cloud Run, Railway, Render, or Firebase Cloud Functions
