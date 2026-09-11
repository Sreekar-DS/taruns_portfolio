-- Operational reporting views adapted from the academic assignment.
USE ecommerce_fulfillment_portfolio;

-- Monthly seller performance: revenue, orders and units.
CREATE OR REPLACE VIEW vw_monthly_sales_by_seller AS
SELECT
    s.seller_id,
    s.company_name,
    DATE_FORMAT(o.order_date, '%Y-%m') AS sales_month,
    SUM(oi.final_price) AS total_sales_amount,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.quantity) AS total_units_sold
FROM orders o
JOIN order_items oi
  ON oi.order_id = o.order_id
JOIN products p
  ON p.product_id = oi.product_id
JOIN sellers s
  ON s.seller_id = p.seller_id
WHERE o.order_status IN ('Confirmed','Packed','Shipped','Delivered','Returned')
GROUP BY
    s.seller_id,
    s.company_name,
    DATE_FORMAT(o.order_date, '%Y-%m');

-- Monthly operational trend: order flow, returns, refunds and return rate.
CREATE OR REPLACE VIEW vw_monthly_order_return_refund_trend AS
SELECT
    DATE_FORMAT(o.order_date, '%Y-%m') AS trend_month,
    COUNT(DISTINCT o.order_id) AS orders_created,
    SUM(CASE WHEN o.order_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_order_rows,
    COUNT(DISTINCT r.return_id) AS returns_requested,
    SUM(CASE WHEN rf.refund_status = 'Processed' THEN rf.refund_amount ELSE 0 END) AS refunds_processed_amount,
    ROUND(
        COUNT(DISTINCT r.return_id) / NULLIF(COUNT(DISTINCT oi.order_item_id), 0) * 100,
        2
    ) AS item_return_rate_percent
FROM orders o
LEFT JOIN order_items oi
  ON oi.order_id = o.order_id
LEFT JOIN returns r
  ON r.order_item_id = oi.order_item_id
LEFT JOIN refunds rf
  ON rf.return_id = r.return_id
GROUP BY DATE_FORMAT(o.order_date, '%Y-%m');

-- Fulfillment-centre workload view.
CREATE OR REPLACE VIEW vw_fc_shipment_workload AS
SELECT
    fc.fc_location_id,
    fc.fc_code,
    fc.fc_name,
    COUNT(s.shipment_id) AS total_shipments,
    SUM(CASE WHEN s.shipment_status IN ('Created','Packed','Dispatched','In Transit') THEN 1 ELSE 0 END) AS open_shipments,
    SUM(CASE WHEN s.shipment_status = 'Exception' THEN 1 ELSE 0 END) AS exception_shipments,
    SUM(CASE WHEN s.shipment_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_shipments
FROM fc_locations fc
LEFT JOIN order_item_shipment s
  ON s.fc_location_id = fc.fc_location_id
GROUP BY fc.fc_location_id, fc.fc_code, fc.fc_name;
