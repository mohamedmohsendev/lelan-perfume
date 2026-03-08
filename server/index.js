import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

// Optional dependencies — server starts even if these aren't installed
let compression, sharp;
try { compression = (await import('compression')).default; } catch { compression = null; }
try { sharp = (await import('sharp')).default; } catch { sharp = null; }

const app = express();
const PORT = process.env.PORT || 3001;

// ── Config ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Fail fast if critical env vars are missing
if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ Missing required env vars: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD');
    process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ── Security & Performance ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
if (compression) app.use(compression());
else console.warn('⚠️ compression not installed — responses won\'t be compressed');
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limit login endpoint — 5 attempts per 15 min
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Multer — support up to 5 images ──────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Helper: upload a file buffer to Supabase Storage ─────────────────────────
async function uploadToStorage(file) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    // Process image with sharp if available, otherwise upload raw
    let processedBuffer, contentType;
    if (sharp) {
        processedBuffer = await sharp(file.buffer)
            .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
        contentType = 'image/webp';
    } else {
        processedBuffer = file.buffer;
        contentType = file.mimetype || 'image/jpeg';
    }

    const { error } = await supabase.storage
        .from('lalen-images')
        .upload(fileName, processedBuffer, {
            contentType,
            upsert: false,
            // Add cache control for 1 year to get high Lighthouse scores
            cacheControl: '31536000',
        });

    if (error) throw error;

    const { data } = supabase.storage.from('lalen-images').getPublicUrl(fileName);
    return data.publicUrl;
}

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized — no token' });
    }
    try {
        req.admin = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Unauthorized — invalid token' });
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── AUTH ───────────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, expiresIn: '24h' });
});

app.get('/api/admin/verify', requireAdmin, (_req, res) => res.json({ valid: true }));

// ══════════════════════════════════════════════════════════════════════════════
// ── PRODUCTS — PUBLIC ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/products', async (_req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const products = (data || []).map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            price30ml: p.price_30ml || '',
            price50ml: p.price_50ml || '',
            price100ml: p.price_100ml || '',
            oldPrice: p.old_price || '',
            description: p.description || '',
            imageUrl: p.image_url,
            images: p.images || [],
            notesTop: p.notes_top || '',
            notesHeart: p.notes_heart || '',
            notesBase: p.notes_base || '',
        }));

        res.json(products);
    } catch (err) {
        console.error('GET /api/products error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { data: p, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        res.json({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            price30ml: p.price_30ml || '',
            price50ml: p.price_50ml || '',
            price100ml: p.price_100ml || '',
            oldPrice: p.old_price || '',
            description: p.description || '',
            imageUrl: p.image_url,
            images: p.images || [],
            notesTop: p.notes_top || '',
            notesHeart: p.notes_heart || '',
            notesBase: p.notes_base || '',
        });
    } catch (err) {
        console.error('GET /api/products/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── PRODUCTS — ADMIN ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// POST — create product (up to 5 images)
app.post('/api/products', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, category, price, price30ml, price50ml, price100ml, oldPrice, description, notesTop, notesHeart, notesBase, imageUrl } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ error: 'name, category, and price are required' });
        }

        // Upload all images
        const imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToStorage(file);
                imageUrls.push(url);
            }
        }

        const mainImage = imageUrls[0] || imageUrl || '';

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name,
                category,
                price,
                price_30ml: price30ml || '',
                price_50ml: price50ml || '',
                price_100ml: price100ml || '',
                old_price: oldPrice || '',
                description: description || '',
                image_url: mainImage,
                images: imageUrls,
                notes_top: notesTop || '',
                notes_heart: notesHeart || '',
                notes_base: notesBase || '',
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: data.id,
            name: data.name,
            category: data.category,
            price: data.price,
            price30ml: data.price_30ml,
            price50ml: data.price_50ml,
            price100ml: data.price_100ml,
            oldPrice: data.old_price,
            description: data.description,
            imageUrl: data.image_url,
            images: data.images,
            notesTop: data.notes_top,
            notesHeart: data.notes_heart,
            notesBase: data.notes_base,
        });
    } catch (err) {
        console.error('POST /api/products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT — update product
app.put('/api/products/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, price30ml, price50ml, price100ml, oldPrice, description, notesTop, notesHeart, notesBase, imageUrl, existingImages } = req.body;
        const updates = {
            name,
            category,
            price,
            price_30ml: price30ml || '',
            price_50ml: price50ml || '',
            price_100ml: price100ml || '',
            old_price: oldPrice || '',
            description: description || '',
            notes_top: notesTop || '',
            notes_heart: notesHeart || '',
            notes_base: notesBase || '',
        };

        // Parse existing images that weren't removed
        let allImages = [];
        try { allImages = JSON.parse(existingImages || '[]'); } catch { allImages = []; }

        // Upload new images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToStorage(file);
                allImages.push(url);
            }
        }

        updates.images = allImages;
        updates.image_url = allImages[0] || imageUrl || '';

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            name: data.name,
            category: data.category,
            price: data.price,
            price30ml: data.price_30ml,
            price50ml: data.price_50ml,
            price100ml: data.price_100ml,
            oldPrice: data.old_price,
            description: data.description,
            imageUrl: data.image_url,
            images: data.images,
            notesTop: data.notes_top,
            notesHeart: data.notes_heart,
            notesBase: data.notes_base,
        });
    } catch (err) {
        console.error('PUT /api/products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── ORDERS — PUBLIC ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, phone, address, notes, cart, total } = req.body;
        if (!customer_name || !phone || !address || !cart) {
            return res.status(400).json({ error: 'customer_name, phone, address, cart required' });
        }

        const { data, error } = await supabase
            .from('orders')
            .insert([{ customer_name, phone, address, notes: notes || '', cart, total: total || 0 }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ id: data.id, status: 'created' });
    } catch (err) {
        console.error('POST /api/orders error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── ADMIN: ORDERS ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /api/admin/orders error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['معلق', 'تم تأكيده', 'تم توصيله', 'تم ارجاعه', 'لم يتم'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('PUT /api/admin/orders/:id/status error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN: EXPORT ORDERS CSV ──
app.get('/api/admin/orders/export', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const BOM = '\uFEFF';
        const headers = ['رقم الطلب', 'التاريخ', 'اسم العميل', 'الهاتف', 'العنوان', 'المنتجات', 'الإجمالي', 'الحالة'];
        const rows = (data || []).map(order => {
            const items = (order.cart || []).map(item =>
                `${item.quantity}x ${item.name || item.product?.name || 'N/A'}${item.size ? ` (${item.size})` : ''}`
            ).join(' | ');
            const date = new Date(order.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return [
                order.id.split('-')[0].toUpperCase(),
                date,
                order.customer_name,
                order.phone,
                `"${(order.address || '').replace(/"/g, '""')}"`,
                `"${items.replace(/"/g, '""')}"`,
                order.total,
                order.status || 'معلق'
            ].join(',');
        });

        const csv = BOM + headers.join(',') + '\n' + rows.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=lalen-orders.csv');
        res.send(csv);
    } catch (err) {
        console.error('GET /api/admin/orders/export error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN: CLEAR ALL ORDERS ──
app.delete('/api/admin/orders/clear-all', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('orders').delete().gt('total', -1);
        if (error) throw error;
        res.json({ success: true, message: 'All orders deleted' });
    } catch (err) {
        console.error('DELETE /api/admin/orders/clear-all error:', err);
        res.status(500).json({ error: err.message });
    }
});
// ── ADMIN: DELETE SINGLE ORDER ──
app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        console.error('DELETE /api/admin/orders/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN: ANALYTICS ───────────────────────────────────────────────────────
app.get('/api/admin/analytics/daily-sales', requireAdmin, async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = supabase.from('analytics_daily_sales').select('*');
        if (start) query = query.gte('date', start);
        if (end) query = query.lte('date', end);

        const { data, error } = await query.order('date', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /api/admin/analytics/daily-sales error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/analytics/monthly-revenue', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('analytics_monthly_revenue').select('*').order('month', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /api/admin/analytics/monthly-revenue error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/analytics/top-products', requireAdmin, async (req, res) => {
    try {
        const { start, end } = req.query;
        const { data, error } = await supabase.rpc('get_top_products', {
            start_date: start || subDays(new Date(), 30).toISOString(),
            end_date: end || new Date().toISOString()
        });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /api/admin/analytics/top-products error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── SITE SETTINGS ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ── TEMP COMPRESSION ENDPOINT ──
app.get('/api/admin/compress-all', requireAdmin, async (req, res) => {
    try {
        console.log('--- Processing Products Images ---');
        const { data: products } = await supabase.from('products').select('*');
        for (const product of products) {
            console.log(`Processing: ${product.name}`);
            let oldImages = [];
            try { oldImages = JSON.parse(product.images || '[]'); } catch { oldImages = []; }

            let newImages = [];
            for (const url of oldImages) {
                if (url.includes('.webp')) { newImages.push(url); continue; }
                const reqBuffer = await fetch(url).then(r => r.arrayBuffer());
                const processed = await sharp(Buffer.from(reqBuffer))
                    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 }).toBuffer();
                const fn = `compressed-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
                await supabase.storage.from('lalen-images').upload(fn, processed, { contentType: 'image/webp', cacheControl: '31536000' });
                const { data } = supabase.storage.from('lalen-images').getPublicUrl(fn);
                newImages.push(data.publicUrl);
            }

            let mainImage = product.image_url;
            if (mainImage && !mainImage.includes('.webp')) {
                const reqBuffer = await fetch(mainImage).then(r => r.arrayBuffer());
                const processed = await sharp(Buffer.from(reqBuffer))
                    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 }).toBuffer();
                const fn = `compressed-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
                await supabase.storage.from('lalen-images').upload(fn, processed, { contentType: 'image/webp', cacheControl: '31536000' });
                const { data } = supabase.storage.from('lalen-images').getPublicUrl(fn);
                mainImage = data.publicUrl;
            }

            await supabase.from('products').update({ image_url: mainImage, images: newImages }).eq('id', product.id);
        }
        res.json({ success: true, message: 'Compression complete' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// GET all settings (public)
app.get('/api/settings', async (_req, res) => {
    try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;

        const settings = {};
        (data || []).forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (err) {
        console.error('GET /api/settings error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT a single setting (admin + optional image upload)
app.put('/api/settings/:key', requireAdmin, (req, res) => {
    const singleUpload = upload.single('image');
    singleUpload(req, res, async (multerErr) => {
        if (multerErr) {
            console.error('Settings multer error:', multerErr);
            return res.status(400).json({ error: 'Upload error: ' + multerErr.message });
        }
        try {
            const { key } = req.params;
            let value = req.body.value || '';

            // If an image was uploaded, store it and use its URL
            if (req.file) {
                value = await uploadToStorage(req.file);
            }

            const { error } = await supabase
                .from('site_settings')
                .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

            if (error) throw error;
            res.json({ key, value });
        } catch (err) {
            console.error('PUT /api/settings error:', err);
            res.status(500).json({ error: err.message });
        }
    });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
    console.log(`✅  LALEN API running → http://localhost:${PORT}`);
    console.log(`🔒 Admin: ${ADMIN_EMAIL}`);
});
