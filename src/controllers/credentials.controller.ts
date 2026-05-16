import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabase.service';
import { blockchainService } from '../services/blockchain.service';
import { AppError } from '../utils/AppError';

// POST /api/credentials — issuer records a credential in Supabase after anchoring on-chain
export const issueCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issuerWallet = (req as any).wallet;
    const trusted = await blockchainService.isIssuerTrusted(issuerWallet);
    if (!trusted) throw new AppError('Not a trusted issuer', 403);

    const { ref_id, title, description, grade, holder_wallet, expires_at, ipfs_cid, tx_hash } = req.body;
    if (!ref_id || !title || !holder_wallet) {
      throw new AppError('ref_id, title, and holder_wallet are required', 400);
    }

    const credential = await supabaseService.createCredential({
      ref_id,
      title,
      description,
      grade,
      holder_wallet: holder_wallet.toLowerCase(),
      issuer_wallet: issuerWallet,
      expires_at,
      ipfs_cid,
      tx_hash
    });

    res.status(201).json(credential);
  } catch (err) {
    next(err);
  }
};

// GET /api/credentials — student lists their own credentials
export const listCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const credentials = await supabaseService.getCredentialsByHolder(wallet);
    res.json(credentials);
  } catch (err) {
    next(err);
  }
};

// GET /api/credentials/:refId — public verify (blockchain + DB combined)
export const verifyCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refId } = req.params as { refId: string };
    const dbRecord = await supabaseService.getCredentialByRefId(refId);
    if (!dbRecord) throw new AppError('Credential not found', 404);

    const dataHash = dbRecord.ref_id + dbRecord.holder_wallet + dbRecord.issuer_wallet;
    const chain = await blockchainService.verifyCredential(refId, dataHash);

    res.json({
      ...dbRecord,
      blockchain: {
        valid: chain.valid,
        revoked: chain.revoked,
        issuer: chain.issuer
      }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/credentials/:refId — issuer revokes in Supabase
export const revokeCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refId } = req.params as { refId: string };
    const issuerWallet = (req as any).wallet;

    const dbRecord = await supabaseService.getCredentialByRefId(refId);
    if (!dbRecord) throw new AppError('Credential not found', 404);
    if (dbRecord.issuer_wallet !== issuerWallet) throw new AppError('Not the issuer', 403);

    await supabaseService.updateCredentialStatus(refId, 'revoked');
    res.json({ revoked: true, refId });
  } catch (err) {
    next(err);
  }
};

// stub — not used directly but imported by routes
export const getCredential = verifyCredential;