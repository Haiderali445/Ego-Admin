import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://rrrxyieafntinwfxeukx.supabase.co';
const supabasePublishableKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || 'sb_publishable_9ToHGX_tPmlCNdJliruBGw_ULMIgS-U';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
