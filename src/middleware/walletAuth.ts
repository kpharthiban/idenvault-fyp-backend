import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

export const requireWallet = (req: Request, res: Response, next: NextFunction) => {
  const wallet = req.headers['x-wallet-address'] as string;

  if (!wallet || !ethers.isAddress(wallet)) {
    return res.status(401).json({ error: 'Valid wallet address required' });
  }

  (req as any).wallet = wallet.toLowerCase();
  next();
};