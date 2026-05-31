import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import {
  issueCredential,
  issueCredentialsBatch,
  listCredentials,
  getCredential,
  revokeCredential,
  verifyCredential
} from '../controllers/credentials.controller';
import { generatePresentation } from '../controllers/presentation.controller';

const router = Router();
router.post('/',         requireWallet, issueCredential);        // Issuer only
router.post('/batch',    requireWallet, issueCredentialsBatch);  // Issuer batch
router.get('/',          requireWallet, listCredentials);        // Student: own credentials
router.get('/:refId',    verifyCredential);                      // Public: no auth needed
router.post('/:refId/present', requireWallet, generatePresentation); // Holder: presentation token
router.delete('/:refId', requireWallet, revokeCredential);      // Issuer only

export { router as credentialsRouter };