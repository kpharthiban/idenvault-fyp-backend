import { Router } from 'express';
import { authRouter } from './auth.routes';
import { credentialsRouter } from './credentials.routes';
import { ipfsRouter } from './ipfs.routes';
import { aiRouter } from './ai.routes';
import { templatesRouter } from './templates.routes';
import { profileRouter } from './profile.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/credentials', credentialsRouter);
router.use('/ipfs', ipfsRouter);
router.use('/ai', aiRouter);
router.use('/templates', templatesRouter);
router.use('/profile', profileRouter);

export { router };