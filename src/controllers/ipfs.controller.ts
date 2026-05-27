import { Request, Response, NextFunction } from 'express';
import { pinataService } from '../services/pinata.service';
import { AppError } from '../utils/AppError';

export const uploadToIPFS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (req.file.mimetype !== 'application/pdf') {
      throw new AppError('Only PDF files are accepted', 400);
    }

    const cid = await pinataService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`
    });
  } catch (err) {
    next(err);
  }
};

export const uploadMetadataToIPFS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body || !req.body.refId) {
      throw new AppError('Request body must include a refId property', 400);
    }

    const cid = await pinataService.uploadJSON(req.body, `credential-${req.body.refId}`);

    res.json({
      cid,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`
    });
  } catch (err) {
    next(err);
  }
};