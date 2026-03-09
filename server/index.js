import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Config ────────────────────────────────────────────────────────────────────
const {
    JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
    SUPABASE_URL, SUPABASE_SERVICE_KEY, CORS_ORIGIN
} = process.env;

if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing critical environment variables!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({
    origin: CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Multer Config ─────────────────────────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Helper: uploadToStorage ───────────────────────────────────────────────────
async function uploadToStorage(file) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    // Process with sharp for consistent webp format
    const processedBuffer = await sharp(file.buffer)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    const { error } = await supabase.storage
        .from('lalen-images')
        .upload(fileName, processedBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: false
        });

    if (error) throw error;

    const { data } = supabase.storage.from('lalen-images').getPublicUrl(fileName);
    return data.publicUrl;
}

// ── Auth Middleware ───────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.admin = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, expiresIn: '24h' });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/admin/verify', requireAdmin, (req, res) => res.json({ valid: true }));

// ── Product Routes ────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.post('/api/products', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const imageUrls = [];
        if (req.files) {
            for (const file of req.files) {
                const url = await uploadToStorage(file);
                imageUrls.push(url);
            }
        }

        const productData = {
            ...req.body,
            images: imageUrls,
            image_url: imageUrls[0] || req.body.image_url || ''
        };

        const { data, error } = await supabase.from('products').insert([productData]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        let allImages = JSON.parse(req.body.existingImages || '[]');
        if (req.files) {
            for (const file of req.files) {
                const url = await uploadToStorage(file);
                allImages.push(url);
            }
        }

        const updates = {
            ...req.body,
            images: allImages,
            image_url: allImages[0] || req.body.image_url || ''
        };
        delete updates.existingImages;

        const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Order Routes ──────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').insert([req.body]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').update({ status: req.body.status }).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/orders/clear-all', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('orders').delete().gt('id', 0); // Placeholder for clear all logic
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Analytics Routes ──────────────────────────────────────────────────────────
app.get('/api/admin/analytics/daily-sales', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('analytics_daily_sales').select('*').order('date', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/analytics/monthly-revenue', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('analytics_monthly_revenue').select('*').order('month', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/analytics/top-products', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_top_products', {
            start_date: req.query.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: req.query.end || new Date().toISOString()
        });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Site Settings ─────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
    try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;
        const settings = {};
        data.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/settings/:key', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        let value = req.body.value || '';
        if (req.file) {
            value = await uploadToStorage(req.file);
        }
        const { error } = await supabase.from('site_settings').upsert({ key: req.params.key, value }, { onConflict: 'key' });
        if (error) throw error;
        res.json({ key: req.params.key, value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Error Handling ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ LALEN API is running on port ${PORT}`);
});