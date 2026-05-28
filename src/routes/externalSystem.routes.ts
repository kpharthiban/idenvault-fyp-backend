import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import {
  connectSystem,
  listConnections,
  disconnectSystem,
  getStudents,
  getStudent,
  getCertificate,
  getCertificateUrl,
} from '../controllers/externalSystem.controller';

const router = Router();

// Connection management
router.post('/connections',                                              requireWallet, connectSystem);
router.get('/connections',                                               requireWallet, listConnections);
router.delete('/connections/:connectionId',                              requireWallet, disconnectSystem);

// Data proxy (scoped to a specific connection)
router.get('/connections/:connectionId/students',                        requireWallet, getStudents);
router.get('/connections/:connectionId/students/:studentId',             requireWallet, getStudent);
router.get('/connections/:connectionId/students/:studentId/certificate', requireWallet, getCertificate);
router.get('/connections/:connectionId/students/:studentId/certificate-url', requireWallet, getCertificateUrl);

export { router as externalSystemRouter };
