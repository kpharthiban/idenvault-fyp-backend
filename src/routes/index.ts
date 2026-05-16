import { Router } from 'express';
import { authRouter } from './auth.routes';
import { credentialsRouter } from './credentials.routes';
import { ipfsRouter } from './ipfs.routes';
import { aiRouter } from './ai.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/credentials', credentialsRouter);
router.use('/ipfs', ipfsRouter);
router.use('/ai', aiRouter);

export { router };