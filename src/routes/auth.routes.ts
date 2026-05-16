import { Router } from 'express';
import { getNonce, verifyWallet } from '../controllers/auth.controller';

const router = Router();
router.get('/nonce', getNonce);
router.post('/verify', verifyWallet);

export { router as authRouter };