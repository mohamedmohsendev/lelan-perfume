import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
    let report = '--- DIAGNOSTIC REPORT ---\n';
    try {
        const { data, count, error } = await supabase.from('products').select('*', { count: 'exact' });
        if (error) {
            report += `❌ Supabase Error: ${error.message}\n`;
        } else {
            report += `✅ Database Connected\n`;
            report += `📊 Product Count: ${count}\n`;
            if (data && data.length > 0) {
                report += `🔍 Sample Product (snake_case): ${JSON.stringify(data[0], null, 2)}\n`;
            } else {
                report += `⚠️ No products found in table.\n`;
            }
        }
    } catch (e) {
        report += `❌ Script Crash: ${e.message}\n`;
    }
    fs.writeFileSync('diagnostic_report.txt', report);
    console.log('Report saved to diagnostic_report.txt');
}

main();
