import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import crypto from 'crypto';

// In-memory nonce store (fine for FYP — use Redis in production)
const nonceStore = new Map<string, string>();

export const getNonce = (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string)?.toLowerCase();
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  const nonce = crypto.randomBytes(16).toString('hex');
  nonceStore.set(wallet, nonce);
  res.json({ nonce });
};

export const verifyWallet = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet, signature } = req.body;
    const expectedNonce = nonceStore.get(wallet.toLowerCase());
    if (!expectedNonce) return res.status(400).json({ error: 'Request a nonce first' });

    const recovered = ethers.verifyMessage(ethers.getBytes('0x' + expectedNonce), signature).toLowerCase();
    if (recovered !== wallet.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Single-use — delete immediately after verification
    nonceStore.delete(wallet.toLowerCase());

    const role = getRole(wallet);
    res.json({ authenticated: true, wallet, role });
  } catch (err) {
    next(err);
  }
};

const getRole = (wallet: string): string => {
  if (wallet.toLowerCase() === process.env.ADMIN_WALLET?.toLowerCase()) return 'admin';
  // Issuer check via IssuerRegistry contract is wired in Phase 4
  return 'student';
};