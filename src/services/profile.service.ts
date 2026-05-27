import { supabase } from '../config/supabase';
import type { ProfileBody } from '../validators/profile.validator';

// The DB column is "institution_type" but the API contract uses "type".
// These helpers translate between the two shapes.

interface ProfileRow {
  wallet_address: string;
  institution: string | null;
  institution_type: string | null;
  department: string | null;
  website: string | null;
  address: string | null;
  updated_at: string;
}

function toApiShape(row: ProfileRow) {
  return {
    institution: row.institution ?? '',
    type: row.institution_type ?? '',
    department: row.department ?? '',
    website: row.website ?? '',
    address: row.address ?? '',
  };
}

export const profileService = {
  async getByWallet(wallet: string) {
    const { data, error } = await supabase
      .from('issuer_profiles')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    // PGRST116 = "no rows returned" — not an error, just no profile yet
    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return toApiShape(data as ProfileRow);
  },

  async upsert(wallet: string, body: ProfileBody) {
    const row = {
      wallet_address: wallet.toLowerCase(),
      institution: body.institution,
      institution_type: body.type,       // map API "type" → DB "institution_type"
      department: body.department,
      website: body.website,
      address: body.address,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('issuer_profiles')
      .upsert(row, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toApiShape(data as ProfileRow);
  },
};
