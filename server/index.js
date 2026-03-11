import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import compression from 'compression';
import sharp from 'sharp';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Config ────────────────────────────────────────────────────────────────────
const {
    JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
    SUPABASE_URL, SUPABASE_SERVICE_KEY, CORS_ORIGIN
} = process.env;

// S6 FIX: Exit on missing critical env vars instead of silently continuing
const requiredEnvVars = { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY };
const missing = Object.entries(requiredEnvVars).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
    console.error(`❌ Missing critical environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// B4 FIX: Proper CORS — require explicit origin, no wildcard with credentials
app.use(cors({
    origin: CORS_ORIGIN ? CORS_ORIGIN.split(',').map(s => s.trim()) : '*',
    credentials: !!CORS_ORIGIN,
}));
app.use(express.json({ limit: '10mb' }));

// S3 FIX: Rate limiting on login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 attempts per window
    message: { error: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,                 // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Multer Config ─────────────────────────────────────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
        }
    },
});

// ── Validation Helpers ────────────────────────────────────────────────────────

// S4 FIX: Validate order input
function validateOrder(body) {
    const errors = [];
    if (!body.customer_name || typeof body.customer_name !== 'string' || body.customer_name.trim().length < 2) {
        errors.push('customer_name is required (min 2 characters)');
    }
    if (!body.phone || typeof body.phone !== 'string' || !/^01[0125]\d{8}$/.test(body.phone.trim())) {
        errors.push('A valid Egyptian phone number is required (11 digits starting with 01)');
    }
    if (!body.address || typeof body.address !== 'string' || body.address.trim().length < 5) {
        errors.push('address is required (min 5 characters)');
    }
    if (!body.cart || !Array.isArray(body.cart) || body.cart.length === 0) {
        errors.push('cart must be a non-empty array');
    }
    if (body.total === undefined || typeof body.total !== 'number' || body.total < 0) {
        errors.push('total must be a non-negative number');
    }
    return errors;
}

// S5 FIX: Validate product input
function validateProduct(body) {
    const errors = [];
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
        errors.push('Product name is required');
    }
    if (!body.category || !['Men', 'Women', 'Unisex'].includes(body.category)) {
        errors.push('Category must be Men, Women, or Unisex');
    }
    // At least one price must be set
    const hasPrice = body.price || body.price30ml || body.price50ml || body.price100ml;
    if (!hasPrice) {
        errors.push('At least one price field is required');
    }
    return errors;
}

// ── Mapping Helpers ───────────────────────────────────────────────────────────

// Map from DB (snake_case) to Frontend (camelCase)
function mapProductFromDB(p) {
    if (!p) return null;
    return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        price30ml: p.price_30ml || '',
        price50ml: p.price_50ml || '',
        price100ml: p.price_100ml || '',
        oldPrice: p.old_price || '',
        oldPrice30ml: p.old_price_30ml || '',
        oldPrice50ml: p.old_price_50ml || '',
        oldPrice100ml: p.old_price_100ml || '',
        description: p.description || '',
        imageUrl: p.image_url || '',
        images: p.images || [],
        notesTop: p.notes_top || '',
        notesHeart: p.notes_heart || '',
        notesBase: p.notes_base || '',
        created_at: p.created_at
    };
}

// Map from Frontend (camelCase) to DB (snake_case)
function mapProductToDB(body) {
    return {
        name: (body.name || '').trim(),
        category: body.category,
        price: (body.price || '').trim(),
        price_30ml: (body.price30ml || '').trim(),
        price_50ml: (body.price50ml || '').trim(),
        price_100ml: (body.price100ml || '').trim(),
        old_price: (body.oldPrice || '').trim(),
        old_price_30ml: (body.oldPrice30ml || '').trim(),
        old_price_50ml: (body.oldPrice50ml || '').trim(),
        old_price_100ml: (body.oldPrice100ml || '').trim(),
        description: (body.description || '').trim(),
        image_url: body.imageUrl || '',
        images: body.images || [],
        notes_top: (body.notesTop || '').trim(),
        notes_heart: (body.notesHeart || '').trim(),
        notes_base: (body.notesBase || '').trim()
    };
}

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
// S3 FIX: Apply rate limiter to login
app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
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
        res.json((data || []).map(mapProductFromDB));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        res.json(mapProductFromDB(data));
    } catch (err) {
        res.status(404).json({ error: 'Product not found' });
    }
});

// S5 FIX: Validate product input before inserting
app.post('/api/products', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        const validationErrors = validateProduct(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }

        const imageUrls = [];
        if (req.files) {
            for (const file of req.files) {
                const url = await uploadToStorage(file);
                imageUrls.push(url);
            }
        }

        const mappedData = mapProductToDB(req.body);
        if (imageUrls.length > 0) {
            mappedData.images = imageUrls;
            mappedData.image_url = imageUrls[0];
        }

        const { data, error } = await supabase.from('products').insert([mappedData]).select().single();
        if (error) throw error;
        res.status(201).json(mapProductFromDB(data));
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

        const mappedData = mapProductToDB(req.body);
        mappedData.images = allImages;
        if (allImages.length > 0) {
            mappedData.image_url = allImages[0];
        } else if (req.body.imageUrl) {
            mappedData.image_url = req.body.imageUrl;
        }

        const { data, error } = await supabase.from('products').update(mappedData).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(mapProductFromDB(data));
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
// S4 FIX: Validate order input and sanitize before inserting
app.post('/api/orders', async (req, res) => {
    try {
        const validationErrors = validateOrder(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }

        // Only insert whitelisted fields
        const orderData = {
            customer_name: req.body.customer_name.trim(),
            phone: req.body.phone.trim(),
            address: req.body.address.trim(),
            notes: (req.body.notes || '').trim(),
            cart: req.body.cart,
            total: req.body.total,
        };

        const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
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
        const { status } = req.body;
        if (!status || typeof status !== 'string') {
            return res.status(400).json({ error: 'Status is required' });
        }
        const { data, error } = await supabase.from('orders').update({ status }).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// B2 FIX: Use a reliable filter for clearing all orders
app.delete('/api/admin/orders/clear-all', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('orders').delete().gte('created_at', '1970-01-01');
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

// B3 FIX: Properly escape all CSV fields
app.get('/api/admin/orders/export', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }

        // Helper to properly escape CSV fields
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Status', 'Total', 'Date'];
        const csvRows = data.map(o => [
            escapeCSV(o.id),
            escapeCSV(o.customer_name),
            escapeCSV(o.phone),
            escapeCSV(o.address),
            escapeCSV(o.status),
            escapeCSV(o.total),
            escapeCSV(new Date(o.created_at).toISOString())
        ]);

        const csvString = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csvString);
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

// B5 FIX: Graceful shutdown handler
let server;

function gracefulShutdown(signal) {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            console.log('✅ Server closed. Exiting process.');
            process.exit(0);
        });
        // Force close after 10 seconds
        setTimeout(() => {
            console.error('⚠️  Forced shutdown after timeout.');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Start Server ──────────────────────────────────────────────────────────────
server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`✅ LALEN API is running on port ${PORT}`);
    try {
        const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
        if (error) console.error('❌ Supabase Products Error:', error.message);
        else console.log(`📊 Products in Database: ${count}`);
    } catch (e) {
        console.error('❌ Startup Check Failed:', e.message);
    }
});