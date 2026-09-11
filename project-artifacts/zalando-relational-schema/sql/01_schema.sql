-- Zalando-style Fashion Marketplace
-- Educational PostgreSQL schema for portfolio demonstration.

DROP SCHEMA IF EXISTS zalando_portfolio CASCADE;
CREATE SCHEMA zalando_portfolio;
SET search_path TO zalando_portfolio;

CREATE TABLE customer (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(30),
    gender_preference VARCHAR(30),
    date_of_birth DATE,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (account_status IN ('ACTIVE','BLOCKED','DELETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE address (
    address_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address_line1 VARCHAR(150) NOT NULL,
    address_line2 VARCHAR(150),
    city VARCHAR(80) NOT NULL,
    state_region VARCHAR(80),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(80) NOT NULL DEFAULT 'Germany'
);

CREATE TABLE customer_address (
    customer_address_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    address_id BIGINT NOT NULL REFERENCES address(address_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('SHIPPING','BILLING','BOTH')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (customer_id, address_id, address_type)
);

CREATE TABLE brand_partner (
    brand_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    partner_type VARCHAR(30) NOT NULL DEFAULT 'BRAND'
        CHECK (partner_type IN ('BRAND','RETAILER','ZALANDO_PRIVATE_LABEL')),
    country_origin VARCHAR(80),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','INACTIVE')),
    joined_at DATE
);

CREATE TABLE category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_category_id BIGINT REFERENCES category(category_id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    category_level SMALLINT NOT NULL DEFAULT 1 CHECK (category_level > 0),
    UNIQUE (parent_category_id, category_name)
);

CREATE TABLE product (
    product_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand_id BIGINT NOT NULL REFERENCES brand_partner(brand_id),
    category_id BIGINT NOT NULL REFERENCES category(category_id),
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    material VARCHAR(120),
    target_gender VARCHAR(20) CHECK (target_gender IN ('WOMEN','MEN','KIDS','UNISEX')),
    sustainability_flag BOOLEAN NOT NULL DEFAULT FALSE,
    product_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (product_status IN ('ACTIVE','INACTIVE','DISCONTINUED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variant (
    variant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    sku VARCHAR(80) NOT NULL UNIQUE,
    size_label VARCHAR(30) NOT NULL,
    color_name VARCHAR(60) NOT NULL,
    fit_type VARCHAR(40),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    variant_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (variant_status IN ('ACTIVE','OUT_OF_STOCK','INACTIVE')),
    UNIQUE (product_id, size_label, color_name)
);

CREATE TABLE product_image (
    image_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order SMALLINT NOT NULL DEFAULT 1 CHECK (display_order > 0),
    alt_text VARCHAR(200)
);

CREATE TABLE product_view (
    view_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT REFERENCES customer(customer_id) ON DELETE SET NULL,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_channel VARCHAR(30) DEFAULT 'WEB'
);

CREATE TABLE cart (
    cart_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    cart_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (cart_status IN ('ACTIVE','CHECKED_OUT','ABANDONED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_item (
    cart_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES cart(cart_id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variant(variant_id),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, variant_id)
);

CREATE TABLE wishlist (
    wishlist_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    wishlist_name VARCHAR(100) NOT NULL DEFAULT 'My Wishlist',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_item (
    wishlist_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlist(wishlist_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (wishlist_id, product_id)
);

CREATE TABLE promotion (
    promotion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promotion_name VARCHAR(120) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT','FIXED')),
    discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    promotion_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (promotion_status IN ('PLANNED','ACTIVE','ENDED','CANCELLED')),
    CHECK (end_at > start_at)
);

CREATE TABLE promotion_product (
    promotion_id BIGINT NOT NULL REFERENCES promotion(promotion_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, product_id)
);

CREATE TABLE customer_order (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id),
    shipping_address_id BIGINT NOT NULL REFERENCES address(address_id),
    billing_address_id BIGINT NOT NULL REFERENCES address(address_id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_status VARCHAR(30) NOT NULL
        CHECK (order_status IN ('PLACED','PAID','PROCESSING','SHIPPED','DELIVERED','PARTIALLY_RETURNED','RETURNED','CANCELLED')),
    currency CHAR(3) NOT NULL DEFAULT 'EUR',
    subtotal_amount NUMERIC(12,2) NOT NULL CHECK (subtotal_amount >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0)
);

CREATE TABLE order_item (
    order_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES customer_order(order_id) ON DELETE CASCADE,
    variant_id BIGINT NOT NULL REFERENCES product_variant(variant_id),
    brand_id BIGINT NOT NULL REFERENCES brand_partner(brand_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE payment (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES customer_order(order_id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(20) NOT NULL
        CHECK (payment_status IN ('PENDING','AUTHORIZED','CAPTURED','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    transaction_reference VARCHAR(120),
    paid_at TIMESTAMPTZ
);

CREATE TABLE shipment (
    shipment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_item(order_item_id) ON DELETE CASCADE,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(120),
    shipment_status VARCHAR(30) NOT NULL
        CHECK (shipment_status IN ('CREATED','HANDED_TO_CARRIER','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION','RETURN_TO_SENDER')),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE shipment_tracking (
    tracking_event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shipment_id BIGINT NOT NULL REFERENCES shipment(shipment_id) ON DELETE CASCADE,
    event_status VARCHAR(50) NOT NULL,
    event_location VARCHAR(120),
    event_time TIMESTAMPTZ NOT NULL,
    event_note VARCHAR(250)
);

CREATE TABLE review (
    review_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
    order_item_id BIGINT REFERENCES order_item(order_item_id) ON DELETE SET NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, product_id, order_item_id)
);

CREATE TABLE review_media (
    review_media_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES review(review_id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('IMAGE','VIDEO'))
);

CREATE TABLE return_request (
    return_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_item_id BIGINT NOT NULL REFERENCES order_item(order_item_id),
    requested_quantity INT NOT NULL DEFAULT 1 CHECK (requested_quantity > 0),
    return_reason VARCHAR(200) NOT NULL,
    return_status VARCHAR(30) NOT NULL
        CHECK (return_status IN ('REQUESTED','APPROVED','REJECTED','IN_TRANSIT','RECEIVED','INSPECTED','COMPLETED')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMPTZ
);

CREATE TABLE refund (
    refund_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    return_id BIGINT NOT NULL UNIQUE REFERENCES return_request(return_id) ON DELETE CASCADE,
    payment_id BIGINT NOT NULL REFERENCES payment(payment_id),
    refund_amount NUMERIC(12,2) NOT NULL CHECK (refund_amount >= 0),
    refund_status VARCHAR(20) NOT NULL CHECK (refund_status IN ('PENDING','PROCESSED','FAILED')),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_brand ON product(brand_id);
CREATE INDEX idx_variant_product_stock ON product_variant(product_id, stock_quantity);
CREATE INDEX idx_view_product_time ON product_view(product_id, viewed_at);
CREATE INDEX idx_order_customer_date ON customer_order(customer_id, order_date);
CREATE INDEX idx_order_status_date ON customer_order(order_status, order_date);
CREATE INDEX idx_order_item_variant ON order_item(variant_id);
CREATE INDEX idx_shipment_status ON shipment(shipment_status);
CREATE INDEX idx_tracking_shipment_time ON shipment_tracking(shipment_id, event_time DESC);
CREATE INDEX idx_return_item_status ON return_request(order_item_id, return_status);
CREATE INDEX idx_review_product_rating ON review(product_id, rating);
