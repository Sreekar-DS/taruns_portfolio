-- E-commerce Fulfillment & Order Operations Database
-- Portfolio-focused subset of the larger academic MySQL schema.
-- MySQL 8+

CREATE DATABASE IF NOT EXISTS ecommerce_fulfillment_portfolio;
USE ecommerce_fulfillment_portfolio;

CREATE TABLE sellers (
    seller_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    seller_status ENUM('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active'
);

CREATE TABLE customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fc_locations (
    fc_location_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fc_code VARCHAR(30) NOT NULL UNIQUE,
    fc_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(80) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    sku VARCHAR(80) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_products_seller
        FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

CREATE TABLE seller_inventory (
    seller_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (seller_id, product_id),
    CONSTRAINT fk_inventory_seller
        FOREIGN KEY (seller_id) REFERENCES sellers(seller_id),
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE products_fc (
    product_id BIGINT NOT NULL,
    fc_location_id BIGINT NOT NULL,
    on_hand_quantity INT NOT NULL DEFAULT 0 CHECK (on_hand_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    last_stock_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, fc_location_id),
    CONSTRAINT fk_products_fc_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_products_fc_location
        FOREIGN KEY (fc_location_id) REFERENCES fc_locations(fc_location_id)
);

CREATE TABLE orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_status ENUM('Confirmed','Packed','Shipped','Delivered','Returned','Cancelled') NOT NULL,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    final_price DECIMAL(12,2) NOT NULL CHECK (final_price >= 0),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE order_item_shipment (
    shipment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_item_id BIGINT NOT NULL,
    fc_location_id BIGINT NOT NULL,
    shipment_direction ENUM('Forward','Reverse') NOT NULL DEFAULT 'Forward',
    carrier_name VARCHAR(120),
    tracking_number VARCHAR(120),
    shipment_status ENUM('Created','Packed','Dispatched','In Transit','Delivered','Exception','Returned') NOT NULL,
    dispatched_at DATETIME NULL,
    delivered_at DATETIME NULL,
    CONSTRAINT fk_shipment_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id),
    CONSTRAINT fk_shipment_fc
        FOREIGN KEY (fc_location_id) REFERENCES fc_locations(fc_location_id)
);

CREATE TABLE shipment_status_history (
    shipment_status_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipment_id BIGINT NOT NULL,
    status_name VARCHAR(60) NOT NULL,
    status_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_note VARCHAR(255),
    CONSTRAINT fk_status_history_shipment
        FOREIGN KEY (shipment_id) REFERENCES order_item_shipment(shipment_id)
        ON DELETE CASCADE
);

CREATE TABLE returns (
    return_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_item_id BIGINT NOT NULL,
    return_reason VARCHAR(255),
    return_status ENUM('Requested','Approved','Rejected','Picked Up','Received','Inspected','Completed') NOT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_at DATETIME NULL,
    CONSTRAINT fk_returns_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
);

CREATE TABLE refunds (
    refund_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    return_id BIGINT NOT NULL UNIQUE,
    refund_amount DECIMAL(12,2) NOT NULL CHECK (refund_amount >= 0),
    refund_status ENUM('Pending','Processed','Failed') NOT NULL,
    processed_at DATETIME NULL,
    CONSTRAINT fk_refunds_return
        FOREIGN KEY (return_id) REFERENCES returns(return_id)
);

CREATE INDEX idx_orders_date_status ON orders(order_date, order_status);
CREATE INDEX idx_shipments_status_fc ON order_item_shipment(shipment_status, fc_location_id);
CREATE INDEX idx_shipment_history_time ON shipment_status_history(shipment_id, status_timestamp);
CREATE INDEX idx_returns_status_date ON returns(return_status, requested_at);
