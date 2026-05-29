import { Router } from 'express';
import { requireWallet } from '../middleware/walletAuth';
import {
  listTemplates,
  getTemplate,
  downloadCsvTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templates.controller';

const router = Router();
router.get('/',                requireWallet, listTemplates);
router.get('/:id/csv-template', requireWallet, downloadCsvTemplate);
router.get('/:id',             requireWallet, getTemplate);
router.post('/',       requireWallet, createTemplate);
router.put('/:id',     requireWallet, updateTemplate);
router.delete('/:id',  requireWallet, deleteTemplate);

export { router as templatesRouter };
