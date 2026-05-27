import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';

const SYSTEM_WALLET = '0x0000000000000000000000000000000000000000';

// ---------------------------------------------------------------------------
// Types (service-layer only — no req/res)
// ---------------------------------------------------------------------------

export interface CreateTemplateInput {
  issuer_wallet: string;
  title: string;
  type: string;
  description?: string;
  issuance_mode: string;
  requires_certificate: boolean;
  fields: any[];
}

export interface UpdateTemplateInput {
  title?: string;
  type?: string;
  description?: string;
  issuance_mode?: string;
  requires_certificate?: boolean;
  fields?: any[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const templatesService = {
  /**
   * Return all templates owned by this issuer PLUS the system defaults.
   * Ordered newest-first.
   */
  async getTemplatesByIssuer(issuerWallet: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .or(`issuer_wallet.eq.${issuerWallet},issuer_wallet.eq.${SYSTEM_WALLET}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Fetch a single template by id.
   * The caller must own it OR it must be a system default — otherwise 404.
   */
  async getTemplateById(id: string, issuerWallet: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    // PGRST116 = no rows returned
    if (error && error.code === 'PGRST116') {
      throw new AppError('Template not found', 404);
    }
    if (error) throw new Error(error.message);

    const isOwner = data.issuer_wallet === issuerWallet;
    const isSystemDefault = data.issuer_wallet === SYSTEM_WALLET;

    if (!isOwner && !isSystemDefault) {
      throw new AppError('Template not found', 404);
    }

    return data;
  },

  /**
   * Insert a new template and return it.
   */
  async createTemplate(input: CreateTemplateInput) {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        issuer_wallet: input.issuer_wallet,
        title: input.title,
        type: input.type,
        description: input.description,
        issuance_mode: input.issuance_mode,
        requires_certificate: input.requires_certificate,
        fields: input.fields,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update a template the issuer owns.
   * System defaults (wallet 0x000…000) are read-only.
   */
  async updateTemplate(id: string, issuerWallet: string, input: UpdateTemplateInput) {
    // 1. Fetch the existing row so we can check ownership
    const existing = await this.getTemplateById(id, issuerWallet);

    if (existing.issuer_wallet === SYSTEM_WALLET) {
      throw new AppError('Cannot edit system default templates', 403);
    }

    if (existing.issuer_wallet !== issuerWallet) {
      throw new AppError('Template not found', 404);
    }

    // 2. Build the update payload — only include provided fields
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.type !== undefined) updates.type = input.type;
    if (input.description !== undefined) updates.description = input.description;
    if (input.issuance_mode !== undefined) updates.issuance_mode = input.issuance_mode;
    if (input.requires_certificate !== undefined) updates.requires_certificate = input.requires_certificate;
    if (input.fields !== undefined) updates.fields = input.fields;

    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .eq('issuer_wallet', issuerWallet)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete a template the issuer owns.
   * System defaults cannot be deleted.
   */
  async deleteTemplate(id: string, issuerWallet: string) {
    // 1. Fetch to verify ownership
    const existing = await this.getTemplateById(id, issuerWallet);

    if (existing.issuer_wallet === SYSTEM_WALLET) {
      throw new AppError('Cannot delete system default templates', 403);
    }

    if (existing.issuer_wallet !== issuerWallet) {
      throw new AppError('Template not found', 404);
    }

    // 2. Delete
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('issuer_wallet', issuerWallet);

    if (error) throw new Error(error.message);
    return true;
  },
};
