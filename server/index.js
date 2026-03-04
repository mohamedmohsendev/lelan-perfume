import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Config ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'lalen-admin-secret-2024';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lalen.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Lalen@2024';

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limit login endpoint — 5 attempts per 15 min
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
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
    const ext = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
        .from('lalen-images')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
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
        const { name, category, price, oldPrice, description, notesTop, notesHeart, notesBase, imageUrl } = req.body;

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
        const { name, category, price, oldPrice, description, notesTop, notesHeart, notesBase, imageUrl, existingImages } = req.body;
        const updates = {
            name,
            category,
            price,
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
// ── SITE SETTINGS ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

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
