import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { templatesService } from '../services/templates.service';
import { createTemplateSchema, updateTemplateSchema } from '../validators/template.validator';
import { AppError } from '../utils/AppError';

/**
 * Turn a ZodError into a human-readable string and wrap it in AppError(400).
 */
function handleValidationError(err: unknown): never {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) =>
      `${issue.path.map(String).join('.')}: ${issue.message}`
    ).join('; ');
    throw new AppError(`Validation error: ${details}`, 400);
  }
  throw err;
}

// GET /api/templates
export const listTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const templates = await templatesService.getTemplatesByIssuer(wallet);
    res.json({ templates });
  } catch (err) {
    next(err);
  }
};

// GET /api/templates/:id
export const getTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const id = req.params.id as string;
    const template = await templatesService.getTemplateById(id, wallet);
    res.json({ template });
  } catch (err) {
    next(err);
  }
};

// POST /api/templates
export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let parsed;
    try {
      parsed = createTemplateSchema.parse(req.body);
    } catch (err) {
      handleValidationError(err);
    }

    const wallet = (req as any).wallet;
    const template = await templatesService.createTemplate({
      ...parsed,
      issuer_wallet: wallet,
    });
    res.status(201).json({ template });
  } catch (err) {
    next(err);
  }
};

// PUT /api/templates/:id
export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let parsed;
    try {
      parsed = updateTemplateSchema.parse(req.body);
    } catch (err) {
      handleValidationError(err);
    }

    const wallet = (req as any).wallet;
    const id = req.params.id as string;
    const template = await templatesService.updateTemplate(id, wallet, parsed);
    res.json({ template });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/templates/:id
export const deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = (req as any).wallet;
    const id = req.params.id as string;
    await templatesService.deleteTemplate(id, wallet);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
