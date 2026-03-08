-- RPC function to fetch top 5 products by unnesting the cart jsonb
CREATE OR REPLACE FUNCTION get_top_products(start_date timestamp, end_date timestamp)
RETURNS TABLE (
  product_name text,
  total_quantity bigint,
  total_revenue numeric
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (item->>'name')::text as name,
    sum((item->>'quantity')::bigint) as qty,
    sum((item->>'price')::numeric * (item->>'quantity')::numeric) as rev
  FROM orders,
  jsonb_array_elements(cart) as item
  WHERE created_at >= start_date AND created_at <= end_date
    AND status != 'cancelled' AND status != 'failed'
  GROUP BY name
  ORDER BY qty DESC
  LIMIT 5;
END;
$$;
