import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { upsertProfileSchema } from '../validators/profile.validator';

// GET /api/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const profile = await profileService.getByWallet(wallet);
    // Return flat object; empty {} when no profile exists yet (never 404)
    res.json(profile ?? {});
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile
export const upsertProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const parsed = upsertProfileSchema.parse(req.body);
    const profile = await profileService.upsert(wallet, parsed);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};
