import { Router } from 'express';
import { authRouter } from './auth.routes';
import { credentialsRouter } from './credentials.routes';
import { ipfsRouter } from './ipfs.routes';
import { aiRouter } from './ai.routes';
import { templatesRouter } from './templates.routes';
import { profileRouter } from './profile.routes';
import { holderProfileRouter } from './holderProfile.routes';
import { adminRouter } from './admin.routes';
import { externalSystemRouter } from './externalSystem.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/credentials', credentialsRouter);
router.use('/ipfs', ipfsRouter);
router.use('/ai', aiRouter);
router.use('/templates', templatesRouter);
router.use('/profile', profileRouter);
router.use('/holder-profile', holderProfileRouter);
router.use('/admin', adminRouter);
router.use('/external-system', externalSystemRouter);

export { router };