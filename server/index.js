import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001; // ريلواي بتحدد الـ Port تلقائياً

// ── Config ────────────────────────────────────────────────────────────────────
const {
    JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD,
    SUPABASE_URL, SUPABASE_SERVICE_KEY, CORS_ORIGIN
} = process.env;

// التحقق من وجود المتغيرات الأساسية
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase configuration!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: CORS_ORIGIN || '*', // استخدام النجمة لفك حظر CORS نهائياً
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const upload = multer({ storage: multer.memoryStorage() });

// ── Auth Middleware ───────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.admin = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// ── API Routes ────────────────────────────────────────────────────────────────

// 1. Health Check (اختبار السيرفر)
app.get('/api/health', (req, res) => res.json({ status: 'LALEN Server is Active' }));

// 2. Auth
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

// 3. Products (جلب المنتجات من Supabase)
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Orders (استقبال طلبات العملاء)
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, phone, address, cart, total } = req.body;
        const { data, error } = await supabase.from('orders').insert([{ customer_name, phone, address, cart, total }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Site Settings
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

// 🚨 الحل النهائي لخطأ "Unexpected token <"
// أي مسار غير موجود هيرد بـ JSON بدل صفحة HTML سوداء
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ LALEN API is running on port ${PORT}`);
});