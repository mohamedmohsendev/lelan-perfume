import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxb3BzbXVqdmZkZmt5YWxscG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Nzk3MTcsImV4cCI6MjA4ODE1NTcxN30._tk7GOJVISfGbi7tw9GZjrWD-e1bB6eBexkQGM57l9Y');

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
