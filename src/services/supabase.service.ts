import { supabase } from '../config/supabase';

export const supabaseService = {
  async createCredential(data: {
    ref_id: string;
    title: string;
    holder_wallet: string;
    issuer_wallet: string;
    expires_at?: string;
    ipfs_cid?: string;
    tx_hash?: string;
    data_hash?: string;
    metadata_cid?: string;
    template_id?: string;
    type?: string;
  }) {
    const { data: row, error } = await supabase
      .from('credentials')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  },

  async getCredentialsByIssuer(issuerWallet: string) {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('issuer_wallet', issuerWallet.toLowerCase())
      .order('issued_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
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

  async createCredentialsBatch(records: Array<{
    ref_id: string;
    title: string;
    holder_wallet: string;
    issuer_wallet: string;
    expires_at?: string;
    ipfs_cid?: string;
    tx_hash?: string;
    data_hash?: string;
    metadata_cid?: string;
    template_id?: string;
    type?: string;
  }>) {
    const { data, error } = await supabase
      .from('credentials')
      .insert(records)
      .select();
    if (error) throw new Error(error.message);
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