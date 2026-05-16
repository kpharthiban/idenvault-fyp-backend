import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security + logging
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Global rate limiter (100 requests per 15 min per IP)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// All routes under /api
app.use('/api', router);
console.log('Routes mounted:', router.stack.map((r: any) => r.regexp));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler — MUST be last
app.use(errorHandler);

export { app };