-- Operational SQL examples for fulfillment and warehouse-style reporting.
USE ecommerce_fulfillment_portfolio;

-- 1. Low-stock products by fulfillment centre.
SELECT
    fc.fc_code,
    fc.fc_name,
    p.sku,
    p.product_name,
    pfc.on_hand_quantity,
    pfc.reserved_quantity,
    pfc.on_hand_quantity - pfc.reserved_quantity AS available_to_allocate
FROM products_fc pfc
JOIN products p
  ON p.product_id = pfc.product_id
JOIN fc_locations fc
  ON fc.fc_location_id = pfc.fc_location_id
WHERE (pfc.on_hand_quantity - pfc.reserved_quantity) <= 10
ORDER BY available_to_allocate ASC, fc.fc_code, p.sku;

-- 2. Shipments that need operational attention.
SELECT
    s.shipment_id,
    fc.fc_code,
    o.order_id,
    oi.order_item_id,
    p.sku,
    s.shipment_status,
    s.carrier_name,
    s.tracking_number,
    s.dispatched_at,
    TIMESTAMPDIFF(HOUR, s.dispatched_at, NOW()) AS hours_since_dispatch
FROM order_item_shipment s
JOIN order_items oi
  ON oi.order_item_id = s.order_item_id
JOIN orders o
  ON o.order_id = oi.order_id
JOIN products p
  ON p.product_id = oi.product_id
JOIN fc_locations fc
  ON fc.fc_location_id = s.fc_location_id
WHERE s.shipment_direction = 'Forward'
  AND s.shipment_status IN ('Dispatched','In Transit','Exception')
  AND s.delivered_at IS NULL
ORDER BY
    CASE WHEN s.shipment_status = 'Exception' THEN 0 ELSE 1 END,
    hours_since_dispatch DESC;

-- 3. Monthly seller leaderboard adapted from the academic Task 3 query.
SELECT
    DATE_FORMAT(o.order_date, '%Y-%m') AS sales_month,
    s.seller_id,
    s.company_name,
    SUM(oi.final_price) AS total_revenue,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity) AS units_sold,
    CASE
        WHEN SUM(oi.final_price) >= 1000 THEN 'High'
        WHEN SUM(oi.final_price) >= 500 THEN 'Medium'
        ELSE 'Low'
    END AS performance_tier
FROM orders o
JOIN order_items oi
  ON oi.order_id = o.order_id
JOIN products p
  ON p.product_id = oi.product_id
JOIN sellers s
  ON s.seller_id = p.seller_id
WHERE o.order_status IN ('Delivered','Shipped','Returned')
GROUP BY
    DATE_FORMAT(o.order_date, '%Y-%m'),
    s.seller_id,
    s.company_name
ORDER BY sales_month DESC, total_revenue DESC;

-- 4. Product return rate and refund impact.
SELECT
    p.product_id,
    p.sku,
    p.product_name,
    COUNT(DISTINCT oi.order_item_id) AS sold_order_items,
    COUNT(DISTINCT r.return_id) AS returned_items,
    ROUND(
        COUNT(DISTINCT r.return_id) / NULLIF(COUNT(DISTINCT oi.order_item_id), 0) * 100,
        2
    ) AS return_rate_pct,
    COALESCE(SUM(CASE WHEN rf.refund_status = 'Processed' THEN rf.refund_amount ELSE 0 END), 0) AS processed_refunds
FROM products p
LEFT JOIN order_items oi
  ON oi.product_id = p.product_id
LEFT JOIN returns r
  ON r.order_item_id = oi.order_item_id
LEFT JOIN refunds rf
  ON rf.return_id = r.return_id
GROUP BY p.product_id, p.sku, p.product_name
ORDER BY return_rate_pct DESC, sold_order_items DESC;

-- 5. Latest event per active shipment using a window function.
WITH ranked_status AS (
    SELECT
        h.shipment_id,
        h.status_name,
        h.status_timestamp,
        h.status_note,
        ROW_NUMBER() OVER (
            PARTITION BY h.shipment_id
            ORDER BY h.status_timestamp DESC, h.shipment_status_id DESC
        ) AS rn
    FROM shipment_status_history h
)
SELECT
    s.shipment_id,
    fc.fc_code,
    s.shipment_status AS current_header_status,
    rs.status_name AS latest_event_status,
    rs.status_timestamp AS latest_event_at,
    rs.status_note
FROM order_item_shipment s
JOIN fc_locations fc
  ON fc.fc_location_id = s.fc_location_id
LEFT JOIN ranked_status rs
  ON rs.shipment_id = s.shipment_id
 AND rs.rn = 1
WHERE s.shipment_status <> 'Delivered'
ORDER BY rs.status_timestamp;
