import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

interface PresentationPayload {
  refId: string;
  holderWallet: string;
  nonce: string;
  iat: number;
  exp: number;
}

export const presentationService = {
  generatePresentationToken(refId: string, holderWallet: string): { token: string; expiresAt: number } {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 30;

    const token = jwt.sign(
      { refId, holderWallet, nonce: crypto.randomUUID() },
      env.PRESENTATION_TOKEN_SECRET,
      { expiresIn: 30 }
    );

    return { token, expiresAt };
  },

  verifyPresentationToken(token: string): { refId: string; holderWallet: string } {
    try {
      const decoded = jwt.verify(token, env.PRESENTATION_TOKEN_SECRET) as PresentationPayload;
      return { refId: decoded.refId, holderWallet: decoded.holderWallet };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('Presentation token has expired');
      }
      throw new Error('Invalid presentation token');
    }
  },
};
