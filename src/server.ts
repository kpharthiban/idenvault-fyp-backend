import dotenv from 'dotenv';
dotenv.config(); // must be at the very top before anything else

import express from 'express';
import { supabase } from './config/supabase';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection by pinging it
    const { error } = await supabase.from('credentials').select('count');
    
    if (error) throw error;
    
    res.json({
      status: 'ok',
      message: 'IdenVault backend is running',
      supabase: 'connected'
    });
  } catch (err: any) {
    res.json({
      status: 'ok',
      message: 'IdenVault backend is running',
      supabase: `error - ${err.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});