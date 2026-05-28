import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { getIssuerProfiles } from '../controllers/admin.controller';

const adminRouter = Router();

adminRouter.post('/issuer-profiles', requireWallet, requireAdmin, getIssuerProfiles);

export { adminRouter };
