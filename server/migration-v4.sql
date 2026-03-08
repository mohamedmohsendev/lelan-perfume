-- ── 1. Add delete policy for orders ──────────────────────────────────────────
-- This allows the service role (backend) to delete all orders
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='service_delete_orders') THEN
    EXECUTE 'CREATE POLICY "service_delete_orders" ON public.orders FOR DELETE USING (true)';
  END IF;
END $$;
