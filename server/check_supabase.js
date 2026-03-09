import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
    try {
        const { data, count, error } = await supabase.from('products').select('*', { count: 'exact' });
        console.log('--- SUPABASE CHECK ---');
        console.log('Error:', error);
        console.log('Count:', count);
        if (data) {
            console.log('First 2 products IDs:', data.slice(0, 2).map(p => p.id));
        } else {
            console.log('No data returned.');
        }
    } catch (e) {
        console.error('Script error:', e);
    }
}

main();
