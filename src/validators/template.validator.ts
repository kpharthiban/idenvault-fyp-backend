import { z } from 'zod';

// ---------------------------------------------------------------------------
// Field definition — one form field inside a credential template
// ---------------------------------------------------------------------------

const fieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'name must be camelCase with no spaces'),
  label: z.string().min(1),
  type: z.enum(['text', 'date', 'select', 'file', 'textarea']),
  required: z.boolean(),
  placeholder: z.string().optional().default(''),
  options: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Pre-process: accept both camelCase (frontend) and snake_case (DB) keys,
// then normalise to snake_case before the schema validates the values.
// ---------------------------------------------------------------------------

function normaliseTemplateBody(raw: Record<string, any>): Record<string, any> {
  const out = { ...raw };

  // issuanceMode → issuance_mode
  if (out.issuanceMode !== undefined && out.issuance_mode === undefined) {
    out.issuance_mode = out.issuanceMode;
  }
  delete out.issuanceMode;

  // requiresCertificate → requires_certificate
  if (out.requiresCertificate !== undefined && out.requires_certificate === undefined) {
    out.requires_certificate = out.requiresCertificate;
  }
  delete out.requiresCertificate;

  return out;
}

// ---------------------------------------------------------------------------
// Create — POST /api/templates
// ---------------------------------------------------------------------------

const createSchemaInner = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['Degree', 'Award', 'Certificate', 'Status']),
  description: z.string().max(1000).optional(),
  issuance_mode: z.enum(['single', 'bulk', 'both']),
  requires_certificate: z.boolean(),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
});

export const createTemplateSchema = z.preprocess(
  (val) => normaliseTemplateBody(val as Record<string, any>),
  createSchemaInner,
);

// ---------------------------------------------------------------------------
// Update — PUT /api/templates/:id  (partial — every key is optional)
// ---------------------------------------------------------------------------

export const updateTemplateSchema = z.preprocess(
  (val) => normaliseTemplateBody(val as Record<string, any>),
  createSchemaInner.partial(),
);

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------

export type CreateTemplateBody = z.infer<typeof createSchemaInner>;
export type UpdateTemplateBody = Partial<CreateTemplateBody>;
export type FieldDefinition = z.infer<typeof fieldSchema>;
