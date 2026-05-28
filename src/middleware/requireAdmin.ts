import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const wallet = (req as any).wallet;
  const adminWallet = process.env.ADMIN_WALLET?.toLowerCase();

  if (!adminWallet || wallet !== adminWallet) {
    throw new AppError('Forbidden: admin access required', 403);
  }

  next();
};
