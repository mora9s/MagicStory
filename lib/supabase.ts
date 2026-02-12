import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okoatevvkruiaveffudp.supabase.co';
const supabaseAnonKey = 'sb_publishable_QsA_MMJiWhJ6mbOJ--yipg_FPbqzh8M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
