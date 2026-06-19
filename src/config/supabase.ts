import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Run this once to verify the connection works
export const testConnection = async () => {
  const { error } = await supabase.from('credentials').select('count');
  if (error) throw new Error(`Supabase connection failed: ${error.message}`);
  console.log('✓ Supabase connected');
};