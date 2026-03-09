import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
    const { data, count, error } = await supabase.from('products').select('*', { count: 'exact' });
    console.log('--- PRODUCTS CHECK ---');
    console.log('Error:', error);
    console.log('Count:', count);
    console.log('Data sample:', data ? data.slice(0, 1) : null);
}

check();
