import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

const app = express();
const port = Number(process.env.PORT || 5000);

// Allow the Vite frontend
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'TripTailor API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/trips', tripRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: 'Something went wrong on the server.',
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`TripTailor API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });