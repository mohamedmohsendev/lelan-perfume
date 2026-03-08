-- View for monthly revenue aggregation
CREATE OR REPLACE VIEW analytics_monthly_revenue AS
SELECT 
  date_trunc('month', created_at) as month,
  sum(total) as revenue,
  count(id) as order_count
FROM orders
WHERE status != 'cancelled' AND status != 'failed'
GROUP BY 1
ORDER BY 1 DESC;
