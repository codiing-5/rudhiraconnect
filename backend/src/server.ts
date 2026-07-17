import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth';
import campsRouter from './routes/camps';
import eligibilityRouter from './routes/eligibility';
import donationsRouter from './routes/donations';
import buddyRouter from './routes/buddy';
import leaderboardRouter from './routes/leaderboard';
import awarenessRouter from './routes/awareness';
import aiRouter from './routes/ai';
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/camps', campsRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/blood-buddy', buddyRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/awareness', awarenessRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);

// Root path test
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'RudhiraConnect Backend is healthy and running.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[RudhiraConnect Server] running on http://localhost:${PORT}`);
});
