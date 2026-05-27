import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import { getProfile, upsertProfile } from '../controllers/profile.controller';

const router = Router();
router.get('/',  requireWallet, getProfile);
router.put('/',  requireWallet, upsertProfile);

export { router as profileRouter };
