import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { AppError } from '../utils/AppError';
import { adminService } from '../services/admin.service';

export const getIssuerProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallets } = req.body;

    if (!Array.isArray(wallets) || wallets.length === 0) {
      throw new AppError('wallets must be a non-empty array', 400);
    }

    if (wallets.length > 50) {
      throw new AppError('Maximum 50 wallet addresses per request', 400);
    }

    for (const addr of wallets) {
      if (typeof addr !== 'string' || !ethers.isAddress(addr)) {
        throw new AppError(`Invalid Ethereum address: ${addr}`, 400);
      }
    }

    const profiles = await adminService.getIssuerProfilesByWallets(wallets);
    res.json({ profiles });
  } catch (err) {
    next(err);
  }
};
