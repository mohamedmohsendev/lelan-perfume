import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
    console.log('🔍 Verifying Supabase setup...\n');

    // 1. products table
    const { data: products, error: pErr } = await supabase.from('products').select('*').limit(5);
    if (pErr) {
        console.log('❌ products table:', pErr.message);
    } else {
        console.log(`✅ products table OK — ${products.length} rows`);
    }

    // 2. orders table
    const { data: orders, error: oErr } = await supabase.from('orders').select('*').limit(5);
    if (oErr) {
        console.log('❌ orders table:', oErr.message);
    } else {
        console.log(`✅ orders table OK — ${orders.length} rows`);
    }

    // 3. storage bucket
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
        console.log('❌ storage:', bErr.message);
    } else {
        const bucket = buckets.find(b => b.name === 'lalen-images');
        if (bucket) {
            console.log(`✅ lalen-images bucket OK — public: ${bucket.public}`);
        } else {
            console.log('❌ lalen-images bucket not found');
        }
    }

    console.log('\n🎉 All checks done!');
}
main().catch(console.error);
