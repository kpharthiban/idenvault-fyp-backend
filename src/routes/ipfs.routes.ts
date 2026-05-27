import { Router } from 'express';
import multer from 'multer';
import { requireWallet } from '../middleware/walletAuth';
import { uploadToIPFS, uploadMetadataToIPFS } from '../controllers/ipfs.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

router.post('/upload', requireWallet, upload.single('file'), uploadToIPFS);
router.post('/upload-metadata', requireWallet, uploadMetadataToIPFS);

export { router as ipfsRouter };