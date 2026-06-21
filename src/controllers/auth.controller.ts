import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { contracts } from '../config/contracts';
import { env } from '../config/env';

const nonceStore = new Map<string, string>();

export const getNonce = (req: Request, res: Response) => {
  const wallet = (req.query.wallet as string)?.toLowerCase();
  if (!wallet) return res.status(400).json({ error: 'wallet required' });
  const nonce = crypto.randomBytes(16).toString('hex');
  nonceStore.set(wallet, nonce);
  res.json({ nonce });
};

export const verifyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet, signature } = req.body;
    const expectedNonce = nonceStore.get(wallet.toLowerCase());
    if (!expectedNonce) return res.status(400).json({ error: 'Request a nonce first' });

    let recovered: string;
    try {
      recovered = ethers.verifyMessage(expectedNonce, signature).toLowerCase();
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    
    if (recovered !== wallet.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    nonceStore.delete(wallet.toLowerCase());

    const role = await getRole(wallet);  // ← now async
    res.json({ authenticated: true, wallet, role });
  } catch (err) {
    next(err);
  }
};

const getRole = async (wallet: string): Promise<string> => {
  if (wallet.toLowerCase() === env.ADMIN_WALLET.toLowerCase()) return 'admin';

  try {
    const provider = new ethers.JsonRpcProvider(env.INFURA_URL);
    const registry = new ethers.Contract(
      contracts.issuerRegistry.address,
      contracts.issuerRegistry.abi,
      provider
    );
    const isTrusted: boolean = await registry.isIssuerTrusted(wallet);
    if (isTrusted) return 'issuer';
  } catch (err) {
    console.error('IssuerRegistry check failed:', err);
    // fail safe → treat as student if blockchain is unreachable
  }

  return 'student';
};