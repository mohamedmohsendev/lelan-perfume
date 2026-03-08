import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function check() {
    const { data } = await supabase.from('products').select('*');
    if (!data) return;
    for (const d of data) {
        console.log(d.name, d.image_url);
    }
}

check();
