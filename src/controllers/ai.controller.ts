import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service';
import { AppError } from '../utils/AppError';

export const generateInterviewQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, issuer, grade, description } = req.body;

    if (!title || !issuer) {
      throw new AppError('title and issuer are required', 400);
    }

    const questions = await geminiService.generateInterviewQuestions({
      title,
      issuer,
      grade,
      description
    });

    res.json({ questions });
  } catch (err) {
    next(err);
  }
};