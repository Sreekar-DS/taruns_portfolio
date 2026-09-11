-- Query optimization example adapted from the academic Task 5.
-- Goal: return products whose return rate is above the portfolio average.
USE ecommerce_fulfillment_portfolio;

-- The original approach repeated the product-level aggregation inside a nested
-- subquery. This version calculates each product's metric once, then calculates
-- the benchmark once and reuses both CTEs.
WITH product_return_rate AS (
    SELECT
        p.product_id,
        p.product_name,
        COUNT(DISTINCT oi.order_item_id) AS sold_items,
        COUNT(DISTINCT r.return_id) AS returned_items,
        ROUND(
            COUNT(DISTINCT r.return_id)
            / NULLIF(COUNT(DISTINCT oi.order_item_id), 0) * 100,
            2
        ) AS return_rate_pct
    FROM products p
    LEFT JOIN order_items oi
      ON oi.product_id = p.product_id
    LEFT JOIN returns r
      ON r.order_item_id = oi.order_item_id
    GROUP BY p.product_id, p.product_name
),
average_return_rate AS (
    SELECT AVG(return_rate_pct) AS avg_return_rate_pct
    FROM product_return_rate
    WHERE sold_items > 0
)
SELECT
    pr.product_id,
    pr.product_name,
    pr.sold_items,
    pr.returned_items,
    pr.return_rate_pct,
    ROUND(a.avg_return_rate_pct, 2) AS portfolio_avg_return_rate_pct
FROM product_return_rate pr
CROSS JOIN average_return_rate a
WHERE pr.sold_items > 0
  AND pr.return_rate_pct > a.avg_return_rate_pct
ORDER BY pr.return_rate_pct DESC, pr.sold_items DESC;

-- Indexes that support the join path for this query are already present on the
-- primary/foreign keys in the simplified schema. On a production-sized system,
-- EXPLAIN ANALYZE should be used to confirm row estimates, join order and scans
-- before and after any additional index is introduced.
