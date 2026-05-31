import { Request, Response, NextFunction } from 'express';
import { presentationService } from '../services/presentation.service';
import { supabaseService } from '../services/supabase.service';
import { blockchainService } from '../services/blockchain.service';
import { AppError } from '../utils/AppError';

export const verifyPresentationToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError('token is required', 400);

    let refId: string;
    let holderWallet: string;
    try {
      const decoded = presentationService.verifyPresentationToken(token);
      refId = decoded.refId;
      holderWallet = decoded.holderWallet;
    } catch (err: any) {
      if (err.message === 'Presentation token has expired') {
        return res.status(401).json({ error: 'Presentation token has expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid presentation token', code: 'TOKEN_INVALID' });
    }

    const dbRecord = await supabaseService.getCredentialByRefId(refId);
    if (!dbRecord) throw new AppError('Credential not found', 404);

    const chain = await blockchainService.getCredentialOnChain(refId, dbRecord.data_hash);

    res.json({
      ...dbRecord,
      blockchain: {
        valid: chain.valid,
        revoked: chain.revoked,
        issuer: chain.issuer,
      },
      presentedBy: holderWallet,
    });
  } catch (err) {
    next(err);
  }
};
