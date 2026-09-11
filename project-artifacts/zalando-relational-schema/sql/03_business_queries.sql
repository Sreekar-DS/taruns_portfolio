-- Business analytics queries for the Zalando-style PostgreSQL schema.
SET search_path TO zalando_portfolio;

-- 1. Top-selling brands by revenue and units.
SELECT
    b.brand_name,
    SUM(oi.quantity) AS units_sold,
    ROUND(SUM(oi.line_total), 2) AS revenue,
    COUNT(DISTINCT oi.order_id) AS orders
FROM order_item oi
JOIN brand_partner b
  ON b.brand_id = oi.brand_id
JOIN customer_order o
  ON o.order_id = oi.order_id
WHERE o.order_status <> 'CANCELLED'
GROUP BY b.brand_name
ORDER BY revenue DESC;

-- 2. Low-stock variants requiring replenishment attention.
SELECT
    p.product_name,
    pv.sku,
    pv.size_label,
    pv.color_name,
    pv.stock_quantity
FROM product_variant pv
JOIN product p
  ON p.product_id = pv.product_id
WHERE pv.stock_quantity < 10
ORDER BY pv.stock_quantity, p.product_name;

-- 3. Return rate by category.
WITH sold AS (
    SELECT
        p.category_id,
        COUNT(DISTINCT oi.order_item_id) AS sold_items
    FROM order_item oi
    JOIN product_variant pv ON pv.variant_id = oi.variant_id
    JOIN product p ON p.product_id = pv.product_id
    JOIN customer_order o ON o.order_id = oi.order_id
    WHERE o.order_status <> 'CANCELLED'
    GROUP BY p.category_id
),
returned AS (
    SELECT
        p.category_id,
        COUNT(DISTINCT rr.return_id) AS returned_items
    FROM return_request rr
    JOIN order_item oi ON oi.order_item_id = rr.order_item_id
    JOIN product_variant pv ON pv.variant_id = oi.variant_id
    JOIN product p ON p.product_id = pv.product_id
    WHERE rr.return_status <> 'REJECTED'
    GROUP BY p.category_id
)
SELECT
    c.category_name,
    s.sold_items,
    COALESCE(r.returned_items, 0) AS returned_items,
    ROUND(100.0 * COALESCE(r.returned_items, 0) / NULLIF(s.sold_items, 0), 2) AS return_rate_pct
FROM sold s
JOIN category c ON c.category_id = s.category_id
LEFT JOIN returned r ON r.category_id = s.category_id
ORDER BY return_rate_pct DESC, s.sold_items DESC;

-- 4. Product-view to purchase conversion proxy.
WITH views AS (
    SELECT product_id, COUNT(*) AS product_views
    FROM product_view
    GROUP BY product_id
),
purchases AS (
    SELECT
        pv.product_id,
        COUNT(DISTINCT oi.order_item_id) AS purchased_items
    FROM order_item oi
    JOIN product_variant pv ON pv.variant_id = oi.variant_id
    JOIN customer_order o ON o.order_id = oi.order_id
    WHERE o.order_status <> 'CANCELLED'
    GROUP BY pv.product_id
)
SELECT
    p.product_name,
    COALESCE(v.product_views, 0) AS product_views,
    COALESCE(x.purchased_items, 0) AS purchased_items,
    ROUND(
        100.0 * COALESCE(x.purchased_items, 0) / NULLIF(v.product_views, 0),
        2
    ) AS view_to_purchase_pct
FROM product p
LEFT JOIN views v ON v.product_id = p.product_id
LEFT JOIN purchases x ON x.product_id = p.product_id
ORDER BY product_views DESC, purchased_items DESC;

-- 5. Average order value by month.
SELECT
    DATE_TRUNC('month', order_date)::date AS month,
    COUNT(*) AS orders,
    ROUND(AVG(total_amount), 2) AS average_order_value,
    ROUND(SUM(total_amount), 2) AS total_revenue
FROM customer_order
WHERE order_status <> 'CANCELLED'
GROUP BY 1
ORDER BY 1;

-- 6. Promotion-linked product sales.
SELECT
    pr.promotion_name,
    p.product_name,
    COUNT(DISTINCT oi.order_item_id) AS sold_items,
    ROUND(COALESCE(SUM(oi.line_total), 0), 2) AS product_revenue
FROM promotion pr
JOIN promotion_product pp ON pp.promotion_id = pr.promotion_id
JOIN product p ON p.product_id = pp.product_id
LEFT JOIN product_variant pv ON pv.product_id = p.product_id
LEFT JOIN order_item oi ON oi.variant_id = pv.variant_id
GROUP BY pr.promotion_name, p.product_name
ORDER BY product_revenue DESC;

-- 7. Latest tracking event per shipment and aging since that event.
WITH latest_event AS (
    SELECT
        st.*,
        ROW_NUMBER() OVER (
            PARTITION BY shipment_id
            ORDER BY event_time DESC, tracking_event_id DESC
        ) AS rn
    FROM shipment_tracking st
)
SELECT
    s.shipment_id,
    s.tracking_number,
    s.shipment_status,
    le.event_status AS latest_event_status,
    le.event_location,
    le.event_time,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - le.event_time)) / 3600.0, 1) AS hours_since_latest_event
FROM shipment s
LEFT JOIN latest_event le
  ON le.shipment_id = s.shipment_id
 AND le.rn = 1
WHERE s.shipment_status <> 'DELIVERED'
ORDER BY le.event_time NULLS FIRST;

-- 8. Average rating by brand.
SELECT
    b.brand_name,
    COUNT(r.review_id) AS review_count,
    ROUND(AVG(r.rating), 2) AS average_rating
FROM review r
JOIN product p ON p.product_id = r.product_id
JOIN brand_partner b ON b.brand_id = p.brand_id
GROUP BY b.brand_name
ORDER BY average_rating DESC, review_count DESC;
