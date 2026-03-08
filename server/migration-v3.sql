-- ══════════════════════════════════════════════════════════════════════════════
-- LALEN Perfumes — Database Migration v3
-- Run this in Supabase SQL Editor AFTER migration-v2
-- Fixes: Bug #2 (missing status column) and Bug #3 (missing size-price columns)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add status column to orders ─────────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Pending';

-- ── 2. Add size-based pricing columns to products ──────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_30ml text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_50ml text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_100ml text NOT NULL DEFAULT '';

-- ── 3. Add update policy for orders (needed for status updates) ────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='service_update_orders') THEN
    EXECUTE 'CREATE POLICY "service_update_orders" ON public.orders FOR UPDATE USING (true)';
  END IF;
END $$;
