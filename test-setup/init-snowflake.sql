-- Snowflake initialization script for integration tests
-- Creates test tables and inserts realistic test data
-- Run this in the Snowflake SQL console (Snowsight or SnowSQL)
--
-- Prerequisites:
--   1. Create a database (e.g. FRESHGUARD_TEST) and schema (e.g. PUBLIC)
--   2. Ensure you have a warehouse available (e.g. COMPUTE_WH)
--   3. Run: USE DATABASE FRESHGUARD_TEST;
--   4. Run: USE SCHEMA PUBLIC;
--   5. Execute this script
--
-- Snowflake dialect notes:
--   - Identifiers are uppercase by default
--   - Uses AUTOINCREMENT for auto-increment columns
--   - CURRENT_TIMESTAMP() returns TIMESTAMP_LTZ
--   - Interval syntax: DATEADD(unit, amount, timestamp)
--   - Supports CREATE OR REPLACE TABLE
--   - No ON CONFLICT; tables are fresh from CREATE OR REPLACE

-- Create customers table
CREATE OR REPLACE TABLE customers (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create products table
CREATE OR REPLACE TABLE products (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMBER(10, 2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create orders table
CREATE OR REPLACE TABLE orders (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount NUMBER(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_date TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create daily_summary table
CREATE OR REPLACE TABLE daily_summary (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    summary_date DATE NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_revenue NUMBER(12, 2) NOT NULL DEFAULT 0,
    unique_customers INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create user_sessions table
CREATE OR REPLACE TABLE user_sessions (
    id INTEGER AUTOINCREMENT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(16777216), -- Snowflake max VARCHAR
    started_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    last_activity TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Insert test customers
INSERT INTO customers (name, email, created_at, updated_at) VALUES
('John Doe',       'john@example.com',    DATEADD(DAY, -2, CURRENT_TIMESTAMP()),    DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
('Jane Smith',     'jane@example.com',    DATEADD(DAY, -1, CURRENT_TIMESTAMP()),    DATEADD(HOUR, -2, CURRENT_TIMESTAMP())),
('Bob Wilson',     'bob@example.com',     DATEADD(HOUR, -3, CURRENT_TIMESTAMP()),   DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
('Alice Johnson',  'alice@example.com',   DATEADD(DAY, -1, CURRENT_TIMESTAMP()),    DATEADD(MINUTE, -30, CURRENT_TIMESTAMP())),
('Charlie Brown',  'charlie@example.com', DATEADD(HOUR, -4, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -15, CURRENT_TIMESTAMP()));

-- Insert test products
INSERT INTO products (name, price, category, created_at, updated_at) VALUES
('Laptop',   999.99, 'Electronics', DATEADD(DAY, -1, CURRENT_TIMESTAMP()),  DATEADD(HOUR, -2, CURRENT_TIMESTAMP())),
('Mouse',     29.99, 'Electronics', DATEADD(DAY, -2, CURRENT_TIMESTAMP()),  DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
('Keyboard',  79.99, 'Electronics', DATEADD(DAY, -1, CURRENT_TIMESTAMP()),  DATEADD(MINUTE, -30, CURRENT_TIMESTAMP())),
('Monitor',  249.99, 'Electronics', DATEADD(HOUR, -3, CURRENT_TIMESTAMP()), DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
('Webcam',    89.99, 'Electronics', DATEADD(DAY, -2, CURRENT_TIMESTAMP()),  DATEADD(MINUTE, -45, CURRENT_TIMESTAMP()));

-- Insert test orders with recent timestamps
INSERT INTO orders (customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
(1, 1, 1, 999.99, 'completed', DATEADD(HOUR, -2, CURRENT_TIMESTAMP()),   DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
(2, 2, 2,  59.98, 'pending',   DATEADD(MINUTE, -30, CURRENT_TIMESTAMP()),DATEADD(MINUTE, -15, CURRENT_TIMESTAMP())),
(3, 3, 1,  79.99, 'completed', DATEADD(HOUR, -1, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -30, CURRENT_TIMESTAMP())),
(1, 4, 1, 249.99, 'shipped',   DATEADD(HOUR, -3, CURRENT_TIMESTAMP()),   DATEADD(HOUR, -1, CURRENT_TIMESTAMP())),
(4, 5, 1,  89.99, 'completed', DATEADD(MINUTE, -45, CURRENT_TIMESTAMP()),DATEADD(MINUTE, -20, CURRENT_TIMESTAMP())),
(2, 1, 1, 999.99, 'pending',   DATEADD(MINUTE, -10, CURRENT_TIMESTAMP()),DATEADD(MINUTE, -5, CURRENT_TIMESTAMP())),
(5, 2, 3,  89.97, 'completed', DATEADD(HOUR, -1, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -45, CURRENT_TIMESTAMP())),
(3, 3, 2, 159.98, 'shipped',   DATEADD(HOUR, -2, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -30, CURRENT_TIMESTAMP()));

-- Insert daily summary data
INSERT INTO daily_summary (summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
(CURRENT_DATE(),                     5, 1529.91, 4, DATEADD(HOUR, -1, CURRENT_TIMESTAMP()),  DATEADD(MINUTE, -30, CURRENT_TIMESTAMP())),
(DATEADD(DAY, -1, CURRENT_DATE()),   8, 2245.88, 5, DATEADD(DAY, -1, CURRENT_TIMESTAMP()),   DATEADD(HOUR, -23, CURRENT_TIMESTAMP())),
(DATEADD(DAY, -2, CURRENT_DATE()),  12, 3456.78, 7, DATEADD(DAY, -2, CURRENT_TIMESTAMP()),   DATEADD(HOUR, -46, CURRENT_TIMESTAMP()));

-- Insert user sessions with recent activity
INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
(1, 'sess_abc123', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', DATEADD(HOUR, -2, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -15, CURRENT_TIMESTAMP()), DATEADD(MINUTE, -15, CURRENT_TIMESTAMP())),
(2, 'sess_def456', '192.168.1.101', 'Mozilla/5.0 (Mac OS X) AppleWebKit/537.36',                   DATEADD(HOUR, -1, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -30, CURRENT_TIMESTAMP()), DATEADD(MINUTE, -30, CURRENT_TIMESTAMP())),
(3, 'sess_ghi789', '192.168.1.102', 'Mozilla/5.0 (Linux; Android 10)',                              DATEADD(MINUTE, -30, CURRENT_TIMESTAMP()),DATEADD(MINUTE, -10, CURRENT_TIMESTAMP()), DATEADD(MINUTE, -10, CURRENT_TIMESTAMP())),
(4, 'sess_jkl012', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',                     DATEADD(MINUTE, -45, CURRENT_TIMESTAMP()),DATEADD(MINUTE, -20, CURRENT_TIMESTAMP()), DATEADD(MINUTE, -20, CURRENT_TIMESTAMP())),
(5, 'sess_mno345', '192.168.1.104', 'Mozilla/5.0 (iPad; CPU OS 15_0)',                              DATEADD(HOUR, -1, CURRENT_TIMESTAMP()),   DATEADD(MINUTE, -5, CURRENT_TIMESTAMP()),  DATEADD(MINUTE, -5, CURRENT_TIMESTAMP()));
