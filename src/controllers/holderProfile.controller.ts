import { Request, Response, NextFunction } from 'express';
import { holderProfileService } from '../services/holderProfile.service';

// GET /api/holder-profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const profile = await holderProfileService.getByWallet(wallet);
    // Return flat object; empty {} when no profile exists yet (never 404)
    res.json(profile ?? {});
  } catch (err) {
    next(err);
  }
};

// PUT /api/holder-profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const { name, student_id, institution, programme } = req.body;
    const profile = await holderProfileService.upsert(wallet, { name, student_id, institution, programme });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};
