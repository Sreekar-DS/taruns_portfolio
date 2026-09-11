-- Small synthetic dataset for the Zalando-style portfolio schema.
-- Run 01_schema.sql first.
SET search_path TO zalando_portfolio;

INSERT INTO customer (customer_id, first_name, last_name, email, account_status)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Anna', 'Keller', 'anna.keller@example.com', 'ACTIVE'),
(2, 'David', 'Meyer', 'david.meyer@example.com', 'ACTIVE'),
(3, 'Sara', 'Hoffmann', 'sara.hoffmann@example.com', 'ACTIVE');

INSERT INTO address (address_id, address_line1, city, state_region, postal_code, country)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Example Str. 10', 'Berlin', 'Berlin', '10115', 'Germany'),
(2, 'Market Str. 5', 'Magdeburg', 'Saxony-Anhalt', '39104', 'Germany'),
(3, 'Central Str. 8', 'Leipzig', 'Saxony', '04109', 'Germany');

INSERT INTO customer_address (customer_address_id, customer_id, address_id, address_type, is_default)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 'BOTH', TRUE),
(2, 2, 2, 'BOTH', TRUE),
(3, 3, 3, 'BOTH', TRUE);

INSERT INTO brand_partner (brand_id, brand_name, partner_type, country_origin, status, joined_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Northline', 'BRAND', 'Germany', 'ACTIVE', DATE '2024-01-15'),
(2, 'Urban Step', 'RETAILER', 'Netherlands', 'ACTIVE', DATE '2024-03-10'),
(3, 'Z-Edit', 'ZALANDO_PRIVATE_LABEL', 'Germany', 'ACTIVE', DATE '2024-02-01');

INSERT INTO category (category_id, parent_category_id, category_name, category_level)
OVERRIDING SYSTEM VALUE VALUES
(1, NULL, 'Men', 1),
(2, NULL, 'Women', 1),
(3, 1, 'Shoes', 2),
(4, 2, 'Jackets', 2),
(5, 2, 'Sportswear', 2);

INSERT INTO product (product_id, brand_id, category_id, product_name, description, material, target_gender, sustainability_flag)
OVERRIDING SYSTEM VALUE VALUES
(1, 2, 3, 'Urban Runner', 'Everyday running-inspired sneaker', 'Textile/Synthetic', 'MEN', FALSE),
(2, 1, 4, 'Rain Shell Jacket', 'Lightweight water-resistant shell', 'Recycled Polyester', 'WOMEN', TRUE),
(3, 3, 5, 'Motion Leggings', 'High-waist training leggings', 'Recycled Polyamide', 'WOMEN', TRUE),
(4, 1, 4, 'City Puffer', 'Insulated winter jacket', 'Polyester', 'WOMEN', FALSE);

INSERT INTO product_variant (variant_id, product_id, sku, size_label, color_name, fit_type, price, stock_quantity, variant_status)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'UR-42-BLK', '42', 'Black', 'Regular', 89.95, 25, 'ACTIVE'),
(2, 1, 'UR-43-BLK', '43', 'Black', 'Regular', 89.95, 5, 'ACTIVE'),
(3, 2, 'RSJ-M-NAV', 'M', 'Navy', 'Regular', 119.95, 18, 'ACTIVE'),
(4, 2, 'RSJ-L-NAV', 'L', 'Navy', 'Regular', 119.95, 3, 'ACTIVE'),
(5, 3, 'ML-M-BLK', 'M', 'Black', 'Slim', 54.95, 40, 'ACTIVE'),
(6, 4, 'CP-M-GRN', 'M', 'Green', 'Relaxed', 149.95, 12, 'ACTIVE');

INSERT INTO product_image (image_id, product_id, image_url, display_order, alt_text)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'https://example.com/images/urban-runner-1.jpg', 1, 'Urban Runner black side view'),
(2, 2, 'https://example.com/images/rain-shell-1.jpg', 1, 'Rain Shell Jacket navy'),
(3, 3, 'https://example.com/images/motion-leggings-1.jpg', 1, 'Motion Leggings black');

INSERT INTO promotion (promotion_id, promotion_name, discount_type, discount_value, start_at, end_at, promotion_status)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Autumn Fashion Week', 'PERCENT', 15, TIMESTAMPTZ '2026-09-01 00:00:00+02', TIMESTAMPTZ '2026-09-30 23:59:59+02', 'ACTIVE');

INSERT INTO promotion_product (promotion_id, product_id) VALUES
(1, 2), (1, 3), (1, 4);

INSERT INTO product_view (view_id, customer_id, product_id, viewed_at, source_channel)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, TIMESTAMPTZ '2026-09-02 10:10:00+02', 'WEB'),
(2, 1, 2, TIMESTAMPTZ '2026-09-02 10:15:00+02', 'WEB'),
(3, 2, 2, TIMESTAMPTZ '2026-09-03 18:05:00+02', 'APP'),
(4, 2, 4, TIMESTAMPTZ '2026-09-03 18:10:00+02', 'APP'),
(5, 3, 3, TIMESTAMPTZ '2026-09-04 08:30:00+02', 'WEB'),
(6, 3, 3, TIMESTAMPTZ '2026-09-04 08:32:00+02', 'WEB'),
(7, 1, 3, TIMESTAMPTZ '2026-09-05 12:00:00+02', 'APP');

INSERT INTO cart (cart_id, customer_id, cart_status, created_at, updated_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'CHECKED_OUT', TIMESTAMPTZ '2026-09-02 10:20:00+02', TIMESTAMPTZ '2026-09-02 10:25:00+02'),
(2, 2, 'CHECKED_OUT', TIMESTAMPTZ '2026-09-03 18:15:00+02', TIMESTAMPTZ '2026-09-03 18:20:00+02'),
(3, 3, 'ACTIVE', TIMESTAMPTZ '2026-09-04 08:35:00+02', TIMESTAMPTZ '2026-09-04 08:35:00+02');

INSERT INTO cart_item (cart_item_id, cart_id, variant_id, quantity, added_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 1, TIMESTAMPTZ '2026-09-02 10:20:00+02'),
(2, 1, 3, 1, TIMESTAMPTZ '2026-09-02 10:22:00+02'),
(3, 2, 4, 1, TIMESTAMPTZ '2026-09-03 18:15:00+02'),
(4, 3, 5, 1, TIMESTAMPTZ '2026-09-04 08:35:00+02');

INSERT INTO wishlist (wishlist_id, customer_id, wishlist_name)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Autumn'), (2, 3, 'Training');

INSERT INTO wishlist_item (wishlist_item_id, wishlist_id, product_id)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 4), (2, 2, 3);

INSERT INTO customer_order (order_id, customer_id, shipping_address_id, billing_address_id, order_date, order_status, subtotal_amount, discount_amount, shipping_amount, total_amount)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 1, TIMESTAMPTZ '2026-09-02 10:30:00+02', 'DELIVERED', 209.90, 17.99, 0, 191.91),
(2, 2, 2, 2, TIMESTAMPTZ '2026-09-03 18:25:00+02', 'PARTIALLY_RETURNED', 119.95, 17.99, 0, 101.96),
(3, 3, 3, 3, TIMESTAMPTZ '2026-09-06 14:00:00+02', 'PROCESSING', 54.95, 8.24, 0, 46.71);

INSERT INTO order_item (order_item_id, order_id, variant_id, brand_id, quantity, unit_price, discount_amount, line_total)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 2, 1, 89.95, 0, 89.95),
(2, 1, 3, 1, 1, 119.95, 17.99, 101.96),
(3, 2, 4, 1, 1, 119.95, 17.99, 101.96),
(4, 3, 5, 3, 1, 54.95, 8.24, 46.71);

INSERT INTO payment (payment_id, order_id, payment_method, payment_status, amount, transaction_reference, paid_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'CARD', 'CAPTURED', 191.91, 'TX-10001', TIMESTAMPTZ '2026-09-02 10:31:00+02'),
(2, 2, 'PAYPAL', 'PARTIALLY_REFUNDED', 101.96, 'TX-10002', TIMESTAMPTZ '2026-09-03 18:26:00+02'),
(3, 3, 'CARD', 'CAPTURED', 46.71, 'TX-10003', TIMESTAMPTZ '2026-09-06 14:01:00+02');

INSERT INTO shipment (shipment_id, order_item_id, carrier_name, tracking_number, shipment_status, shipped_at, delivered_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'DHL', 'DHL-001', 'DELIVERED', TIMESTAMPTZ '2026-09-02 18:00:00+02', TIMESTAMPTZ '2026-09-04 11:00:00+02'),
(2, 2, 'DHL', 'DHL-002', 'DELIVERED', TIMESTAMPTZ '2026-09-02 18:00:00+02', TIMESTAMPTZ '2026-09-04 11:10:00+02'),
(3, 3, 'Hermes', 'HMS-003', 'DELIVERED', TIMESTAMPTZ '2026-09-04 09:00:00+02', TIMESTAMPTZ '2026-09-05 15:20:00+02'),
(4, 4, 'DHL', 'DHL-004', 'CREATED', NULL, NULL);

INSERT INTO shipment_tracking (tracking_event_id, shipment_id, event_status, event_location, event_time, event_note)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'HANDED_TO_CARRIER', 'Berlin', TIMESTAMPTZ '2026-09-02 18:00:00+02', NULL),
(2, 1, 'DELIVERED', 'Berlin', TIMESTAMPTZ '2026-09-04 11:00:00+02', NULL),
(3, 2, 'HANDED_TO_CARRIER', 'Berlin', TIMESTAMPTZ '2026-09-02 18:00:00+02', NULL),
(4, 2, 'DELIVERED', 'Berlin', TIMESTAMPTZ '2026-09-04 11:10:00+02', NULL),
(5, 3, 'HANDED_TO_CARRIER', 'Magdeburg', TIMESTAMPTZ '2026-09-04 09:00:00+02', NULL),
(6, 3, 'DELIVERED', 'Magdeburg', TIMESTAMPTZ '2026-09-05 15:20:00+02', NULL);

INSERT INTO return_request (return_id, order_item_id, requested_quantity, return_reason, return_status, requested_at, received_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 3, 1, 'Size did not fit', 'COMPLETED', TIMESTAMPTZ '2026-09-06 09:00:00+02', TIMESTAMPTZ '2026-09-09 13:00:00+02');

INSERT INTO refund (refund_id, return_id, payment_id, refund_amount, refund_status, processed_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 2, 101.96, 'PROCESSED', TIMESTAMPTZ '2026-09-10 10:00:00+02');

INSERT INTO review (review_id, customer_id, product_id, order_item_id, rating, review_text, created_at)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 1, 5, 'Comfortable and true to size.', TIMESTAMPTZ '2026-09-05 12:00:00+02'),
(2, 1, 2, 2, 4, 'Lightweight and good for rain.', TIMESTAMPTZ '2026-09-05 12:05:00+02'),
(3, 2, 2, 3, 3, 'Good quality, but the size did not fit.', TIMESTAMPTZ '2026-09-06 09:10:00+02');
