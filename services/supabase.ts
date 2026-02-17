import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://amcqyxkkufmjheaanznn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HbU6LAjP8EM3Ck92Io5lGQ_8LX9YDdV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);