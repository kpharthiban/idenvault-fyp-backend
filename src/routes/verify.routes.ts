import { Router } from 'express';
import { verifyPresentationToken } from '../controllers/verify.controller';

const router = Router();
router.post('/token', verifyPresentationToken); // Public: no auth needed

export { router as verifyRouter };
