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

    const { ref_id, title, holder_wallet, expires_at, ipfs_cid, tx_hash, data_hash, metadata_cid, template_id, type } = req.body;
    if (!ref_id || !title || !holder_wallet) {
      throw new AppError('ref_id, title, and holder_wallet are required', 400);
    }

    const credential = await supabaseService.createCredential({
      ref_id,
      title,
      holder_wallet: holder_wallet.toLowerCase(),
      issuer_wallet: issuerWallet,
      expires_at,
      ipfs_cid,
      tx_hash,
      data_hash,
      metadata_cid,
      template_id,
      type,
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
    const role = req.query.role as string;

    let credentials;
    if (role === 'issuer') {
      credentials = await supabaseService.getCredentialsByIssuer(wallet);
    } else {
      credentials = await supabaseService.getCredentialsByHolder(wallet);
    }

    res.json({ credentials });
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

    const chain = await blockchainService.getCredentialOnChain(refId, dbRecord.data_hash);

    res.json({
      ...dbRecord,
      blockchain: {
        valid: chain.valid,
        revoked: chain.revoked,
        issuer: chain.issuer,
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

// POST /api/credentials/batch — issuer records multiple credentials after batch anchoring
export const issueCredentialsBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issuerWallet = (req as any).wallet;
    const trusted = await blockchainService.isIssuerTrusted(issuerWallet);
    if (!trusted) throw new AppError('Not a trusted issuer', 403);

    const { credentials: credentialsList } = req.body;

    if (!Array.isArray(credentialsList) || credentialsList.length === 0) {
      throw new AppError('credentials array is required and must not be empty', 400);
    }

    if (credentialsList.length > 50) {
      throw new AppError('Maximum 50 credentials per batch', 400);
    }

    // Validate each record has required fields
    for (const cred of credentialsList) {
      if (!cred.ref_id || !cred.title || !cred.holder_wallet) {
        throw new AppError('Each credential must have ref_id, title, and holder_wallet', 400);
      }
    }

    // Stamp issuer wallet on all records
    const records = credentialsList.map((cred: any) => ({
      ref_id: cred.ref_id,
      title: cred.title,
      type: cred.type,
      holder_wallet: cred.holder_wallet.toLowerCase(),
      issuer_wallet: issuerWallet,
      template_id: cred.template_id,
      ipfs_cid: cred.ipfs_cid || null,
      metadata_cid: cred.metadata_cid || null,
      tx_hash: cred.tx_hash || null,
      data_hash: cred.data_hash || null,
      expires_at: cred.expires_at || null,
    }));

    const saved = await supabaseService.createCredentialsBatch(records);
    res.status(201).json({ credentials: saved, count: saved.length });
  } catch (err) {
    next(err);
  }
};

// stub — not used directly but imported by routes
export const getCredential = verifyCredential;