# TripTailor — Ready-to-Run MERN Project

This folder is a cleaned runnable version of TripTailor with the existing React UI, MongoDB-backed authentication, JWT sessions, bcrypt password hashing, and MongoDB-backed saved itineraries.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Install everything
From the **TripTailor root folder**:

```bash
npm install
npm run setup
```

## 2. Configure MongoDB
The included `server/.env` is ready for a local MongoDB server:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/triptailor
```

If you use MongoDB Atlas, replace that value with your `mongodb+srv://...` connection string.

Change `JWT_SECRET` before deploying publicly.

## 3. Start the complete application
From the root:

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
Health check: http://localhost:5000/api/health

If you prefer two terminals:

```bash
npm run client
npm run server
```

## What is connected to MongoDB
- Register → MongoDB `users` collection
- Login → MongoDB user lookup + bcrypt password verification
- Session → JWT
- Profile updates → MongoDB
- Save itinerary → MongoDB `itineraries` and `trips`
- Previous itineraries → MongoDB
- Delete itinerary → MongoDB, protected by the logged-in user's JWT

No demo login account is included in the authentication flow.

## Important note about AI
The current supplied TripTailor UI generates itinerary suggestions locally. No AI provider key was available, so this package does not pretend that a live external AI service is connected. MongoDB authentication and saved itineraries are the real backend flows.

## Verification
The package includes a backend smoke test:

```bash
npm test --prefix server
```

The frontend can be production-built with:

```bash
npm run build --prefix client
```
