import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabase.service';
import { presentationService } from '../services/presentation.service';
import { AppError } from '../utils/AppError';

export const generatePresentation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refId } = req.params as { refId: string };
    const holderWallet = (req as any).wallet;

    const credential = await supabaseService.getCredentialByRefId(refId);
    if (!credential || credential.holder_wallet !== holderWallet) {
      throw new AppError('Credential not found or access denied', 403);
    }

    const { token, expiresAt } = presentationService.generatePresentationToken(refId, holderWallet);
    res.json({ token, expiresAt });
  } catch (err) {
    next(err);
  }
};
