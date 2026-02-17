-- BigQuery initialization script for integration tests
-- Creates test tables and inserts realistic test data
-- Run this in the BigQuery SQL console against your test dataset
--
-- Prerequisites:
--   1. Create a dataset (e.g. `freshguard_test`) in your GCP project
--   2. Replace `freshguard_test` below with your dataset name if different
--   3. Run each statement individually or as a script in the BigQuery console
--
-- BigQuery dialect notes:
--   - No auto-increment / SERIAL — use INT64 and supply IDs explicitly
--   - No UNIQUE or FOREIGN KEY constraints
--   - Use TIMESTAMP for timestamps (CURRENT_TIMESTAMP() is a function call)
--   - Use NUMERIC instead of DECIMAL
--   - Interval syntax: INTERVAL N HOUR, INTERVAL N DAY, etc.
--   - No IF NOT EXISTS for CREATE TABLE; use CREATE OR REPLACE TABLE
--   - No ON CONFLICT / INSERT OR IGNORE; tables are always fresh from CREATE OR REPLACE

-- Create customers table
CREATE OR REPLACE TABLE freshguard_test.customers (
    id INT64 NOT NULL,
    name STRING NOT NULL,
    email STRING NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Create products table
CREATE OR REPLACE TABLE freshguard_test.products (
    id INT64 NOT NULL,
    name STRING NOT NULL,
    price NUMERIC NOT NULL,
    category STRING,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Create orders table
CREATE OR REPLACE TABLE freshguard_test.orders (
    id INT64 NOT NULL,
    customer_id INT64,
    product_id INT64,
    quantity INT64 NOT NULL,
    total_amount NUMERIC NOT NULL,
    status STRING,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Create daily_summary table
CREATE OR REPLACE TABLE freshguard_test.daily_summary (
    id INT64 NOT NULL,
    summary_date DATE NOT NULL,
    total_orders INT64 NOT NULL,
    total_revenue NUMERIC NOT NULL,
    unique_customers INT64 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Create user_sessions table
CREATE OR REPLACE TABLE freshguard_test.user_sessions (
    id INT64 NOT NULL,
    user_id INT64 NOT NULL,
    session_token STRING NOT NULL,
    ip_address STRING,
    user_agent STRING,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Insert test customers
INSERT INTO freshguard_test.customers (id, name, email, created_at, updated_at) VALUES
(1, 'John Doe',       'john@example.com',    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY),    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(2, 'Jane Smith',     'jane@example.com',    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY),    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)),
(3, 'Bob Wilson',     'bob@example.com',     TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(4, 'Alice Johnson',  'alice@example.com',   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY),    TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
(5, 'Charlie Brown',  'charlie@example.com', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 4 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE));

-- Insert test products
INSERT INTO freshguard_test.products (id, name, price, category, created_at, updated_at) VALUES
(1, 'Laptop',   999.99, 'Electronics', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR)),
(2, 'Mouse',     29.99, 'Electronics', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(3, 'Keyboard',  79.99, 'Electronics', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
(4, 'Monitor',  249.99, 'Electronics', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 HOUR), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(5, 'Webcam',    89.99, 'Electronics', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE));

-- Insert test orders with recent timestamps
INSERT INTO freshguard_test.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
(1, 1, 1, 1, 999.99, 'completed', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(2, 2, 2, 2,  59.98, 'pending',   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)),
(3, 3, 3, 1,  79.99, 'completed', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
(4, 1, 4, 1, 249.99, 'shipped',   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)),
(5, 4, 5, 1,  89.99, 'completed', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)),
(6, 2, 1, 1, 999.99, 'pending',   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE)),
(7, 5, 2, 3,  89.97, 'completed', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE)),
(8, 3, 3, 2, 159.98, 'shipped',   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE));

-- Insert daily summary data
INSERT INTO freshguard_test.daily_summary (id, summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
(1, CURRENT_DATE(),                                5, 1529.91, 4, TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
(2, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY),      8, 2245.88, 5, TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 23 HOUR)),
(3, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY),     12, 3456.78, 7, TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 DAY),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 46 HOUR));

-- Insert user sessions with recent activity
INSERT INTO freshguard_test.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
(1, 1, 'sess_abc123', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 2 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)),
(2, 2, 'sess_def456', '192.168.1.101', 'Mozilla/5.0 (Mac OS X) AppleWebKit/537.36',                   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)),
(3, 3, 'sess_ghi789', '192.168.1.102', 'Mozilla/5.0 (Linux; Android 10)',                              TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE)),
(4, 4, 'sess_jkl012', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',                     TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 45 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE), TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)),
(5, 5, 'sess_mno345', '192.168.1.104', 'Mozilla/5.0 (iPad; CPU OS 15_0)',                              TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR),   TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE),  TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE));
