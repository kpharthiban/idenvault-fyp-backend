import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { generateInterviewQuestions } from '../controllers/ai.controller';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 5,                 // 5 requests per minute per IP
  message: { error: 'Too many requests, please wait.' }
});

router.post('/interview-questions', aiLimiter, generateInterviewQuestions);

export { router as aiRouter };