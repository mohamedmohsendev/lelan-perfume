-- View for daily sales trends
CREATE OR REPLACE VIEW analytics_daily_sales AS
SELECT 
  date_trunc('day', created_at) as date,
  sum(total) as revenue,
  count(id) as order_count
FROM orders
WHERE status != 'cancelled' AND status != 'failed'
GROUP BY 1
ORDER BY 1 DESC;
