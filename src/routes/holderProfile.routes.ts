import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import { getProfile, updateProfile } from '../controllers/holderProfile.controller';

const router = Router();
router.get('/',  requireWallet, getProfile);
router.put('/',  requireWallet, updateProfile);

export { router as holderProfileRouter };
