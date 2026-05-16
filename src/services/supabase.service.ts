import { supabase } from '../config/supabase';

export const supabaseService = {
  async createCredential(data: {
    ref_id: string;
    title: string;
    description?: string;
    grade?: string;
    holder_wallet: string;
    issuer_wallet: string;
    expires_at?: string;
    ipfs_cid?: string;
    tx_hash?: string;
  }) {
    const { data: row, error } = await supabase
      .from('credentials')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  },

  async getCredentialsByHolder(holderWallet: string) {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('holder_wallet', holderWallet.toLowerCase());
    if (error) throw new Error(error.message);
    return data;
  },

  async getCredentialByRefId(refId: string) {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('ref_id', refId)
      .single();
    if (error) return null; // not found is okay
    return data;
  },

  async updateCredentialStatus(refId: string, status: string) {
    const { error } = await supabase
      .from('credentials')
      .update({ status })
      .eq('ref_id', refId);
    if (error) throw new Error(error.message);
  }
};