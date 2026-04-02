import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

export const env = {
  PORT: process.env.PORT || '5000',
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY'),
  INFURA_URL: required('INFURA_URL'),
  PINATA_JWT: required('PINATA_JWT'),
  GEMINI_API_KEY: required('GEMINI_API_KEY'),
  ADMIN_WALLET: required('ADMIN_WALLET'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};