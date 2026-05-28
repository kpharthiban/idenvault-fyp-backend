import { supabase } from '../config/supabase';

interface ProfileData {
  institution: string | null;
  institution_type: string | null;
  department: string | null;
  website: string | null;
  address: string | null;
}

export const adminService = {
  async getIssuerProfilesByWallets(wallets: string[]): Promise<Record<string, ProfileData>> {
    const lowered = wallets.map((w) => w.toLowerCase());

    const { data, error } = await supabase
      .from('issuer_profiles')
      .select('wallet_address, institution, institution_type, department, website, address')
      .in('wallet_address', lowered);

    if (error) throw new Error(error.message);

    const profiles: Record<string, ProfileData> = {};
    for (const row of data ?? []) {
      profiles[row.wallet_address] = {
        institution: row.institution,
        institution_type: row.institution_type,
        department: row.department,
        website: row.website,
        address: row.address,
      };
    }

    return profiles;
  },
};
