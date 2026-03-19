
-- =========================================================
-- ALL-IN-ONE SQL (MySQL/MariaDB) - CLEAN VERSION
-- Schema + Seed + Admin + Views + Sample Data
-- =========================================================

CREATE DATABASE IF NOT EXISTS ecommerce_cms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE ecommerce_cms;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- AUTH / RBAC
-- =========================
CREATE TABLE IF NOT EXISTS roles (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(50) NOT NULL UNIQUE,
name VARCHAR(100) NOT NULL,
description VARCHAR(255) NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(120) NOT NULL UNIQUE,
name VARCHAR(150) NOT NULL,
group_name VARCHAR(100) NULL,
description VARCHAR(255) NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
role_id BIGINT UNSIGNED NOT NULL,
permission_id BIGINT UNSIGNED NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (role_id, permission_id),
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(191) NOT NULL UNIQUE,
phone VARCHAR(30) NULL UNIQUE,
username VARCHAR(100) NULL UNIQUE,
full_name VARCHAR(150) NOT NULL,
password_hash VARCHAR(255) NOT NULL,
avatar_url VARCHAR(500) NULL,
status ENUM('ACTIVE','LOCKED','PENDING','DELETED') NOT NULL DEFAULT 'ACTIVE',
email_verified_at DATETIME NULL,
phone_verified_at DATETIME NULL,
last_login_at DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
user_id BIGINT UNSIGNED NOT NULL,
role_id BIGINT UNSIGNED NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (user_id, role_id),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT UNSIGNED NOT NULL,
token_hash VARCHAR(255) NOT NULL UNIQUE,
user_agent VARCHAR(255) NULL,
ip_address VARCHAR(64) NULL,
expires_at DATETIME NOT NULL,
revoked_at DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
INDEX idx_refresh_tokens_user (user_id),
INDEX idx_refresh_tokens_expires (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_logs (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT UNSIGNED NULL,
email_attempt VARCHAR(191) NULL,
ip_address VARCHAR(64) NULL,
user_agent VARCHAR(255) NULL,
success TINYINT(1) NOT NULL DEFAULT 0,
reason VARCHAR(255) NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
INDEX idx_login_logs_user (user_id),
INDEX idx_login_logs_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
actor_user_id BIGINT UNSIGNED NULL,
action VARCHAR(100) NOT NULL,
entity_type VARCHAR(100) NOT NULL,
entity_id VARCHAR(100) NOT NULL,
old_values JSON NULL,
new_values JSON NULL,
ip_address VARCHAR(64) NULL,
user_agent VARCHAR(255) NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
INDEX idx_audit_entity (entity_type, entity_id),
INDEX idx_audit_actor (actor_user_id),
INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- =========================
-- SETTINGS / CONTACT
-- =========================
CREATE TABLE IF NOT EXISTS app_settings (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
setting_key VARCHAR(120) NOT NULL UNIQUE,
setting_value JSON NULL,
description VARCHAR(255) NULL,
updated_by BIGINT UNSIGNED NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
full_name VARCHAR(150) NOT NULL,
email VARCHAR(191) NULL,
phone VARCHAR(30) NULL,
subject VARCHAR(200) NULL,
message TEXT NOT NULL,
status ENUM('NEW','READ','REPLIED','ARCHIVED') NOT NULL DEFAULT 'NEW',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
INDEX idx_contact_status (status),
INDEX idx_contact_created (created_at)
) ENGINE=InnoDB;

-- =========================
-- MEDIA
-- =========================
CREATE TABLE IF NOT EXISTS media (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
public_id VARCHAR(255) NOT NULL UNIQUE,
secure_url VARCHAR(500) NOT NULL,
resource_type ENUM('image','video','raw') NOT NULL DEFAULT 'image',
format VARCHAR(20) NULL,
width INT UNSIGNED NULL,
height INT UNSIGNED NULL,
bytes BIGINT UNSIGNED NULL,
folder VARCHAR(255) NULL,
alt_text VARCHAR(255) NULL,
created_by BIGINT UNSIGNED NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE IF NOT EXISTS product_categories (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
parent_id BIGINT UNSIGNED NULL,
name VARCHAR(150) NOT NULL,
slug VARCHAR(191) NOT NULL UNIQUE,
description TEXT NULL,
sort_order INT NOT NULL DEFAULT 0,
is_active TINYINT(1) NOT NULL DEFAULT 1,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_tags (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
slug VARCHAR(120) NOT NULL UNIQUE,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
sku VARCHAR(80) NOT NULL UNIQUE,
name VARCHAR(191) NOT NULL,
slug VARCHAR(191) NOT NULL UNIQUE,
short_description TEXT NULL,
description LONGTEXT NULL,
status ENUM('DRAFT','ACTIVE','INACTIVE','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
compare_price DECIMAL(15,2) NULL,
cost_price DECIMAL(15,2) NULL,
stock_qty INT NOT NULL DEFAULT 0,
low_stock_threshold INT NOT NULL DEFAULT 5,
track_inventory TINYINT(1) NOT NULL DEFAULT 1,
weight_grams INT UNSIGNED NULL,
seo_title VARCHAR(191) NULL,
seo_description VARCHAR(255) NULL,
published_at DATETIME NULL,
created_by BIGINT UNSIGNED NULL,
updated_by BIGINT UNSIGNED NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME NULL,
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_category_map (
product_id BIGINT UNSIGNED NOT NULL,
category_id BIGINT UNSIGNED NOT NULL,
PRIMARY KEY (product_id, category_id),
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_tag_map (
product_id BIGINT UNSIGNED NOT NULL,
tag_id BIGINT UNSIGNED NOT NULL,
PRIMARY KEY (product_id, tag_id),
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_media (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT UNSIGNED NOT NULL,
media_id BIGINT UNSIGNED NOT NULL,
is_primary TINYINT(1) NOT NULL DEFAULT 0,
sort_order INT NOT NULL DEFAULT 0,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE ON UPDATE CASCADE,
UNIQUE KEY uq_product_media_unique (product_id, media_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventory_movements (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT UNSIGNED NOT NULL,
movement_type ENUM('IN','OUT','ADJUST') NOT NULL,
quantity INT NOT NULL,
before_qty INT NOT NULL,
after_qty INT NOT NULL,
reason VARCHAR(255) NULL,
ref_type VARCHAR(100) NULL,
ref_id VARCHAR(100) NULL,
created_by BIGINT UNSIGNED NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================
-- CART / ORDER / PAYMENT
-- =========================
CREATE TABLE IF NOT EXISTS coupons (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(50) NOT NULL UNIQUE,
discount_type ENUM('PERCENT','FIXED') NOT NULL,
discount_value DECIMAL(15,2) NOT NULL,
min_order_value DECIMAL(15,2) NULL,
max_discount_value DECIMAL(15,2) NULL,
usage_limit INT NULL,
usage_count INT NOT NULL DEFAULT 0,
starts_at DATETIME NULL,
ends_at DATETIME NULL,
is_active TINYINT(1) NOT NULL DEFAULT 1,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carts (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT UNSIGNED NULL,
session_id VARCHAR(191) NULL UNIQUE,
status ENUM('ACTIVE','ORDERED','ABANDONED') NOT NULL DEFAULT 'ACTIVE',
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
cart_id BIGINT UNSIGNED NOT NULL,
product_id BIGINT UNSIGNED NOT NULL,
quantity INT NOT NULL DEFAULT 1,
unit_price DECIMAL(15,2) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
UNIQUE KEY uq_cart_product (cart_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
order_no VARCHAR(40) NOT NULL UNIQUE,
user_id BIGINT UNSIGNED NULL,
cart_id BIGINT UNSIGNED NULL,
status ENUM('PENDING','CONFIRMED','PAID','PROCESSING','SHIPPED','COMPLETED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
payment_status ENUM('UNPAID','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED') NOT NULL DEFAULT 'UNPAID',
fulfillment_status ENUM('UNFULFILLED','PARTIAL','FULFILLED','RETURNED') NOT NULL DEFAULT 'UNFULFILLED',
customer_name VARCHAR(150) NOT NULL,
customer_email VARCHAR(191) NULL,
customer_phone VARCHAR(30) NOT NULL,
shipping_address_line1 VARCHAR(255) NOT NULL,
shipping_city VARCHAR(100) NOT NULL,
shipping_country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
discount_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0.00,
tax_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
grand_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
placed_at DATETIME NULL,
paid_at DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
order_id BIGINT UNSIGNED NOT NULL,
product_id BIGINT UNSIGNED NULL,
sku VARCHAR(80) NOT NULL,
product_name VARCHAR(191) NOT NULL,
quantity INT NOT NULL,
unit_price DECIMAL(15,2) NOT NULL,
line_total DECIMAL(15,2) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
order_id BIGINT UNSIGNED NOT NULL,
provider ENUM('SEPAY') NOT NULL DEFAULT 'SEPAY',
method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
amount DECIMAL(15,2) NOT NULL,
currency VARCHAR(10) NOT NULL DEFAULT 'VND',
transaction_ref VARCHAR(120) NULL,
raw_response JSON NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
UNIQUE KEY uq_payments_provider_ref (provider, transaction_ref)
) ENGINE=InnoDB;

-- =========================
-- CMS POSTS
-- =========================
CREATE TABLE IF NOT EXISTS post_categories (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
parent_id BIGINT UNSIGNED NULL,
name VARCHAR(150) NOT NULL,
slug VARCHAR(191) NOT NULL UNIQUE,
description TEXT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (parent_id) REFERENCES post_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_tags (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
slug VARCHAR(120) NOT NULL UNIQUE,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
author_id BIGINT UNSIGNED NULL,
title VARCHAR(255) NOT NULL,
slug VARCHAR(191) NOT NULL UNIQUE,
excerpt TEXT NULL,
content LONGTEXT NULL,
status ENUM('DRAFT','PUBLISHED','PRIVATE','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
seo_title VARCHAR(191) NULL,
seo_description VARCHAR(255) NULL,
published_at DATETIME NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================
-- BUILDER
-- =========================
CREATE TABLE IF NOT EXISTS builder_pages (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(191) NOT NULL,
slug VARCHAR(191) NOT NULL UNIQUE,
page_type ENUM('HOME','LANDING','PRODUCT','POST','CATEGORY','CUSTOM') NOT NULL DEFAULT 'CUSTOM',
status ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
current_version_no INT UNSIGNED NOT NULL DEFAULT 1,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS builder_page_versions (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
page_id BIGINT UNSIGNED NOT NULL,
version_no INT UNSIGNED NOT NULL,
schema_json JSON NOT NULL,
is_published TINYINT(1) NOT NULL DEFAULT 0,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (page_id) REFERENCES builder_pages(id) ON DELETE CASCADE ON UPDATE CASCADE,
UNIQUE KEY uq_page_version (page_id, version_no)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS theme_tokens (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(191) NOT NULL UNIQUE,
colors JSON NOT NULL,
typography JSON NOT NULL,
spacing JSON NOT NULL,
radius JSON NULL,
shadow JSON NULL,
is_default TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- =========================
-- WORDPRESS IMPORT TRACKING
-- =========================
CREATE TABLE IF NOT EXISTS wp_import_runs (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
source_file VARCHAR(255) NOT NULL,
status ENUM('RUNNING','SUCCESS','FAILED','PARTIAL') NOT NULL DEFAULT 'RUNNING',
started_at DATETIME NOT NULL,
finished_at DATETIME NULL,
success_count INT NOT NULL DEFAULT 0,
failed_count INT NOT NULL DEFAULT 0,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- SEED CORE
-- =========================================================
INSERT INTO roles (code, name, description) VALUES
('SUPER_ADMIN','Super Admin','Full access'),
('ADMIN','Admin','Administration access'),
('EDITOR','Editor','Content management access'),
('CUSTOMER','Customer','Customer access')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

INSERT INTO permissions (code, name, group_name) VALUES
('auth.read','Read auth info','auth'),
('user.read','Read users','user'),
('user.update','Update users','user'),
('product.read','Read products','product'),
('product.create','Create products','product'),
('product.update','Update products','product'),
('post.read','Read posts','post'),
('post.create','Create posts','post'),
('post.update','Update posts','post'),
('order.read','Read orders','order'),
('order.update','Update orders','order'),
('builder.read','Read builder','builder'),
('builder.update','Update builder','builder'),
('builder.publish','Publish builder','builder'),
('media.read','Read media','media'),
('media.upload','Upload media','media'),
('setting.read','Read settings','setting'),
('setting.update','Update settings','setting')
ON DUPLICATE KEY UPDATE name=VALUES(name), group_name=VALUES(group_name);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p WHERE r.code='SUPER_ADMIN';

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
('site.general', JSON_OBJECT('siteName','My Shop','currency','VND'), 'General'),
('site.contact', JSON_OBJECT('hotline','0900000000','email','support@example.com'), 'Contact'),
('payment.sepay', JSON_OBJECT('enabled', true), 'SEPAY')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), description=VALUES(description);

INSERT INTO theme_tokens (name, colors, typography, spacing, radius, shadow, is_default)
VALUES (
'default',
JSON_OBJECT('primary','#2563eb','text','#111827','bg','#ffffff'),
JSON_OBJECT('fontFamily','Inter, sans-serif','baseSize','16px'),
JSON_OBJECT('sm','8','md','16','lg','24'),
JSON_OBJECT('sm','4','md','8'),
JSON_OBJECT('card','0 4px 12px rgba(0,0,0,0.08)'),
1
)
ON DUPLICATE KEY UPDATE colors=VALUES(colors);

-- =========================================================
-- ADMIN USER
-- =========================================================
INSERT INTO users (email, full_name, password_hash, status, email_verified_at)
VALUES ('admin@example.com','System Admin','$argon2id$v=19$m=65536,t=3,p=1$REPLACE_ME$REPLACE_ME','ACTIVE',NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), status=VALUES(status);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.code='SUPER_ADMIN'
WHERE u.email='admin@example.com';

-- =========================================================
-- SAMPLE DATA
-- =========================================================
INSERT INTO users (email, full_name, password_hash, status, email_verified_at)
VALUES
('customer1@example.com', 'Nguyen Van A', '$argon2id$v=19$m=65536,t=3,p=1$REPLACE$REPLACE', 'ACTIVE', NOW()),
('customer2@example.com', 'Tran Thi B', '$argon2id$v=19$m=65536,t=3,p=1$REPLACE$REPLACE', 'ACTIVE', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.code='CUSTOMER'
WHERE u.email IN ('customer1@example.com','customer2@example.com');

INSERT INTO product_categories (name, slug, description, is_active)
VALUES
('Hoa chúc mừng', 'hoa-chuc-mung', 'Danh mục hoa chúc mừng', 1),
('Hoa sinh nhật', 'hoa-sinh-nhat', 'Danh mục hoa sinh nhật', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (sku, name, slug, status, price, stock_qty, published_at)
VALUES
('SP001','Bó hoa chúc mừng sang trọng','bo-hoa-chuc-mung-sang-trong','ACTIVE',850000,50,NOW()),
('SP002','Bó hoa sinh nhật ngọt ngào','bo-hoa-sinh-nhat-ngot-ngao','ACTIVE',650000,80,NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), stock_qty=VALUES(stock_qty);

INSERT IGNORE INTO product_category_map (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN product_categories c
WHERE p.sku='SP001' AND c.slug='hoa-chuc-mung';

INSERT IGNORE INTO product_category_map (product_id, category_id)
SELECT p.id, c.id FROM products p JOIN product_categories c
WHERE p.sku='SP002' AND c.slug='hoa-sinh-nhat';

INSERT INTO media (public_id, secure_url, resource_type, format, width, height, bytes, folder, alt_text)
VALUES
('products/SP001/main','https://res.cloudinary.com/demo/image/upload/v1/products/SP001/main.jpg','image','jpg',1200,1200,180000,'products/SP001','SP001'),
('products/SP002/main','https://res.cloudinary.com/demo/image/upload/v1/products/SP002/main.jpg','image','jpg',1200,1200,170000,'products/SP002','SP002')
ON DUPLICATE KEY UPDATE secure_url=VALUES(secure_url);

INSERT IGNORE INTO product_media (product_id, media_id, is_primary, sort_order)
SELECT p.id, m.id, 1, 0
FROM products p JOIN media m ON m.public_id = CONCAT('products/', p.sku, '/main')
WHERE p.sku IN ('SP001','SP002');

INSERT INTO post_categories (name, slug, description)
VALUES ('Tin tức', 'tin-tuc', 'Tin tức mới')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO posts (author_id, title, slug, excerpt, content, status, published_at)
SELECT u.id, 'Top mẫu bó hoa chúc mừng đẹp', 'top-mau-bo-hoa-chuc-mung-dep',
'Danh sách mẫu hoa hot trend', 'Nội dung bài viết mẫu...', 'PUBLISHED', NOW()
FROM users u WHERE u.email='admin@example.com'
ON DUPLICATE KEY UPDATE title=VALUES(title), status='PUBLISHED';

INSERT INTO carts (user_id, status)
SELECT id, 'ACTIVE' FROM users WHERE email='customer1@example.com'
ON DUPLICATE KEY UPDATE status='ACTIVE';

INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
SELECT c.id, p.id, 2, p.price
FROM carts c
JOIN users u ON u.id=c.user_id
JOIN products p ON p.sku='SP001'
WHERE u.email='customer1@example.com'
ON DUPLICATE KEY UPDATE quantity=2;

INSERT INTO orders (
order_no, user_id, cart_id, status, payment_status, fulfillment_status,
customer_name, customer_email, customer_phone,
shipping_address_line1, shipping_city, shipping_country,
subtotal, discount_total, shipping_fee, tax_total, grand_total, placed_at
)
SELECT
'ORD202603180001', u.id, c.id, 'PENDING', 'UNPAID', 'UNFULFILLED',
'Nguyen Van A', 'customer1@example.com', '0901111111',
'123 Le Loi', 'Hai Phong', 'Vietnam',
1700000, 0, 30000, 0, 1730000, NOW()
FROM users u
JOIN carts c ON c.user_id=u.id
WHERE u.email='customer1@example.com'
ON DUPLICATE KEY UPDATE grand_total=VALUES(grand_total);

INSERT INTO order_items (order_id, product_id, sku, product_name, quantity, unit_price, line_total)
SELECT o.id, p.id, p.sku, p.name, 2, p.price, p.price*2
FROM orders o JOIN products p ON p.sku='SP001'
WHERE o.order_no='ORD202603180001'
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

INSERT INTO payments (order_id, provider, method, status, amount, currency, transaction_ref, raw_response)
SELECT o.id, 'SEPAY', 'BANK_TRANSFER', 'PENDING', o.grand_total, 'VND', 'SEPAY_REF_0001',
JSON_OBJECT('note','sample pending payment')
FROM orders o
WHERE o.order_no='ORD202603180001'
ON DUPLICATE KEY UPDATE amount=VALUES(amount), status='PENDING';

-- =========================================================
-- VIEWS
-- =========================================================
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT
o.id, o.order_no, o.status, o.payment_status, o.fulfillment_status,
o.customer_name, o.customer_phone, o.grand_total, o.created_at,
u.email AS user_email
FROM orders o
LEFT JOIN users u ON u.id = o.user_id;

CREATE OR REPLACE VIEW v_products_with_primary_image AS
SELECT
p.id, p.sku, p.name, p.slug, p.status, p.price, p.stock_qty,
m.secure_url AS primary_image_url
FROM products p
LEFT JOIN product_media pm ON pm.product_id = p.id AND pm.is_primary = 1
LEFT JOIN media m ON m.id = pm.media_id;

CREATE OR REPLACE VIEW v_published_posts AS
SELECT id, title, slug, excerpt, seo_title, seo_description, published_at
FROM posts
WHERE status='PUBLISHED';

-- done


