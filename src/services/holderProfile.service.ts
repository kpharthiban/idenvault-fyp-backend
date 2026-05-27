import { supabase } from '../config/supabase';

interface HolderProfileRow {
  wallet_address: string;
  name: string | null;
  student_id: string | null;
  institution: string | null;
  programme: string | null;
  updated_at: string;
}

function toApiShape(row: HolderProfileRow) {
  return {
    name: row.name ?? '',
    student_id: row.student_id ?? '',
    institution: row.institution ?? '',
    programme: row.programme ?? '',
  };
}

export const holderProfileService = {
  async getByWallet(wallet: string) {
    const { data, error } = await supabase
      .from('holder_profiles')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    // PGRST116 = "no rows returned" — not an error, just no profile yet
    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);
    return toApiShape(data as HolderProfileRow);
  },

  async upsert(wallet: string, body: { name?: string; student_id?: string; institution?: string; programme?: string }) {
    const row = {
      wallet_address: wallet.toLowerCase(),
      name: body.name,
      student_id: body.student_id,
      institution: body.institution,
      programme: body.programme,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('holder_profiles')
      .upsert(row, { onConflict: 'wallet_address' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toApiShape(data as HolderProfileRow);
  },
};
