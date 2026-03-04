-- ══════════════════════════════════════════════════════════════════════════════
-- LALEN Perfumes — Database Migration v2
-- Run this in Supabase SQL Editor AFTER the initial setup
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Add new columns to products ────────────────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes_top text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes_heart text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes_base text NOT NULL DEFAULT '';

-- ── 2. Site settings table (key-value) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='public_read_settings') THEN
    EXECUTE 'CREATE POLICY "public_read_settings" ON public.site_settings FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='service_upsert_settings') THEN
    EXECUTE 'CREATE POLICY "service_upsert_settings" ON public.site_settings FOR INSERT WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='service_update_settings') THEN
    EXECUTE 'CREATE POLICY "service_update_settings" ON public.site_settings FOR UPDATE USING (true)';
  END IF;
END $$;

-- ── 3. Seed default settings ──────────────────────────────────────────────────
INSERT INTO public.site_settings (key, value) VALUES
  ('logo_url', ''),
  ('hero_bg', ''),
  ('men_bg', ''),
  ('women_bg', ''),
  ('unisex_bg', '')
ON CONFLICT (key) DO NOTHING;
