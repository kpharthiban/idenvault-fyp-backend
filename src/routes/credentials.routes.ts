import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import {
  issueCredential,
  listCredentials,
  getCredential,
  revokeCredential,
  verifyCredential
} from '../controllers/credentials.controller';

const router = Router();
router.post('/',         requireWallet, issueCredential);   // Issuer only
router.get('/',          requireWallet, listCredentials);   // Student: own credentials
router.get('/:refId',    verifyCredential);                 // Public: no auth needed
router.delete('/:refId', requireWallet, revokeCredential); // Issuer only

export { router as credentialsRouter };