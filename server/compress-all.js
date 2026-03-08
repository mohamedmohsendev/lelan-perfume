import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function downloadAndCompress(url) {
    if (!url) return '';
    if (url.includes('.webp')) {
        console.log(`Skipping already webp: ${url}`);
        return url; // Already processed
    }

    try {
        console.log(`Downloading: ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`Compressing...`);
        const processedBuffer = await sharp(buffer)
            .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const fileName = `compressed-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        console.log(`Uploading ${fileName}...`);
        const { error } = await supabase.storage
            .from('lalen-images')
            .upload(fileName, processedBuffer, {
                contentType: 'image/webp',
                upsert: false,
                cacheControl: '31536000'
            });

        if (error) throw error;

        const { data } = supabase.storage.from('lalen-images').getPublicUrl(fileName);
        console.log(`Finished: ${data.publicUrl}`);
        return data.publicUrl;
    } catch (e) {
        console.error(`Error processing ${url}:`, e);
        return url; // Keep old URL if failed
    }
}

async function processProducts() {
    console.log('--- Processing Products ---');
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) throw error;

    for (const product of products) {
        console.log(`\nProcessing Product: ${product.name}`);
        let oldImages = [];
        try { oldImages = JSON.parse(product.images || '[]'); } catch { oldImages = []; }

        let newImages = [];
        for (const imgUrl of oldImages) {
            const newUrl = await downloadAndCompress(imgUrl);
            newImages.push(newUrl);
        }

        const mainImage = await downloadAndCompress(product.image_url);

        // Update product if any URL changed
        const hasChanges = String(oldImages) !== String(newImages) || product.image_url !== mainImage;
        if (hasChanges) {
            console.log('Updating DB record for ' + product.name);
            await supabase.from('products').update({
                image_url: mainImage,
                images: JSON.stringify(newImages),
                // in the table, images is a JSONB array maybe? 
                // actually in index.js we do updates.images = allImages (array), so supabase handles it
            }).eq('id', product.id);
        }

    }
}

async function processSettings() {
    console.log('\n--- Processing Settings ---');
    const { data: settings, error } = await supabase.from('settings').select('*');
    if (error) throw error;

    for (const setting of settings) {
        // Skip text settings or non-images
        if (!setting.value || !setting.value.startsWith('http')) continue;

        console.log(`Processing Setting: ${setting.key}`);
        const newUrl = await downloadAndCompress(setting.value);
        if (newUrl !== setting.value) {
            await supabase.from('settings').update({ value: newUrl }).eq('key', setting.key);
        }
    }
}

async function main() {
    try {
        await processProducts();
        await processSettings();
        console.log('\nDONE ALL COMPRESSION');
    } catch (e) {
        console.error(e);
    }
}

main();
