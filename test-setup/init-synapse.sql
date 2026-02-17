-- Azure Synapse Analytics initialization script for integration tests
-- Creates test tables and inserts realistic test data
-- Uses T-SQL syntax compatible with Synapse dedicated SQL pools
--
-- Prerequisites:
--   1. Have a Synapse workspace with a dedicated SQL pool running
--   2. Connect using SSMS, Azure Data Studio, or the Synapse Studio SQL editor
--   3. Execute this script against your test database
--
-- Synapse dedicated SQL pool notes:
--   - No IDENTITY on tables by default (use explicit IDs or IDENTITY with limitations)
--   - No FOREIGN KEY constraints (enforced at app level)
--   - No UNIQUE constraints on columns
--   - Uses ROUND_ROBIN distribution by default
--   - Uses CLUSTERED COLUMNSTORE INDEX by default
--   - DATETIME2 for timestamps, GETDATE() for current time
--   - GO separates batches
--   - Schema defaults to dbo
--   - No IF NOT EXISTS for CREATE TABLE; use IF OBJECT_ID check

-- Create customers table
IF OBJECT_ID('dbo.customers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.customers (
        id INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )
    WITH (DISTRIBUTION = ROUND_ROBIN);
END;
GO

-- Create products table
IF OBJECT_ID('dbo.products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.products (
        id INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )
    WITH (DISTRIBUTION = ROUND_ROBIN);
END;
GO

-- Create orders table
IF OBJECT_ID('dbo.orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.orders (
        id INT NOT NULL,
        customer_id INT,
        product_id INT,
        quantity INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status NVARCHAR(50),
        order_date DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )
    WITH (DISTRIBUTION = ROUND_ROBIN);
END;
GO

-- Create daily_summary table
IF OBJECT_ID('dbo.daily_summary', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.daily_summary (
        id INT NOT NULL,
        summary_date DATE NOT NULL,
        total_orders INT NOT NULL,
        total_revenue DECIMAL(12, 2) NOT NULL,
        unique_customers INT NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )
    WITH (DISTRIBUTION = ROUND_ROBIN);
END;
GO

-- Create user_sessions table
IF OBJECT_ID('dbo.user_sessions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_sessions (
        id INT NOT NULL,
        user_id INT NOT NULL,
        session_token NVARCHAR(255) NOT NULL,
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(4000), -- Synapse max for non-MAX columns
        started_at DATETIME2 DEFAULT GETDATE(),
        last_activity DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )
    WITH (DISTRIBUTION = ROUND_ROBIN);
END;
GO

-- Insert test customers
-- Synapse: check with COUNT to avoid duplicates on re-run
IF (SELECT COUNT(*) FROM dbo.customers) = 0
BEGIN
    INSERT INTO dbo.customers (id, name, email, created_at, updated_at) VALUES
    (1, 'John Doe',       'john@example.com',    DATEADD(DAY, -2, GETDATE()),    DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.customers (id, name, email, created_at, updated_at) VALUES
    (2, 'Jane Smith',     'jane@example.com',    DATEADD(DAY, -1, GETDATE()),    DATEADD(HOUR, -2, GETDATE()));
    INSERT INTO dbo.customers (id, name, email, created_at, updated_at) VALUES
    (3, 'Bob Wilson',     'bob@example.com',     DATEADD(HOUR, -3, GETDATE()),   DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.customers (id, name, email, created_at, updated_at) VALUES
    (4, 'Alice Johnson',  'alice@example.com',   DATEADD(DAY, -1, GETDATE()),    DATEADD(MINUTE, -30, GETDATE()));
    INSERT INTO dbo.customers (id, name, email, created_at, updated_at) VALUES
    (5, 'Charlie Brown',  'charlie@example.com', DATEADD(HOUR, -4, GETDATE()),   DATEADD(MINUTE, -15, GETDATE()));
END;
GO

-- Insert test products
IF (SELECT COUNT(*) FROM dbo.products) = 0
BEGIN
    INSERT INTO dbo.products (id, name, price, category, created_at, updated_at) VALUES
    (1, 'Laptop',   999.99, 'Electronics', DATEADD(DAY, -1, GETDATE()),  DATEADD(HOUR, -2, GETDATE()));
    INSERT INTO dbo.products (id, name, price, category, created_at, updated_at) VALUES
    (2, 'Mouse',     29.99, 'Electronics', DATEADD(DAY, -2, GETDATE()),  DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.products (id, name, price, category, created_at, updated_at) VALUES
    (3, 'Keyboard',  79.99, 'Electronics', DATEADD(DAY, -1, GETDATE()),  DATEADD(MINUTE, -30, GETDATE()));
    INSERT INTO dbo.products (id, name, price, category, created_at, updated_at) VALUES
    (4, 'Monitor',  249.99, 'Electronics', DATEADD(HOUR, -3, GETDATE()), DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.products (id, name, price, category, created_at, updated_at) VALUES
    (5, 'Webcam',    89.99, 'Electronics', DATEADD(DAY, -2, GETDATE()),  DATEADD(MINUTE, -45, GETDATE()));
END;
GO

-- Insert test orders
IF (SELECT COUNT(*) FROM dbo.orders) = 0
BEGIN
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (1, 1, 1, 1, 999.99, 'completed', DATEADD(HOUR, -2, GETDATE()),   DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (2, 2, 2, 2,  59.98, 'pending',   DATEADD(MINUTE, -30, GETDATE()),DATEADD(MINUTE, -15, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (3, 3, 3, 1,  79.99, 'completed', DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -30, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (4, 1, 4, 1, 249.99, 'shipped',   DATEADD(HOUR, -3, GETDATE()),   DATEADD(HOUR, -1, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (5, 4, 5, 1,  89.99, 'completed', DATEADD(MINUTE, -45, GETDATE()),DATEADD(MINUTE, -20, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (6, 2, 1, 1, 999.99, 'pending',   DATEADD(MINUTE, -10, GETDATE()),DATEADD(MINUTE, -5, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (7, 5, 2, 3,  89.97, 'completed', DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -45, GETDATE()));
    INSERT INTO dbo.orders (id, customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (8, 3, 3, 2, 159.98, 'shipped',   DATEADD(HOUR, -2, GETDATE()),   DATEADD(MINUTE, -30, GETDATE()));
END;
GO

-- Insert daily summary data
IF (SELECT COUNT(*) FROM dbo.daily_summary) = 0
BEGIN
    INSERT INTO dbo.daily_summary (id, summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
    (1, CAST(GETDATE() AS DATE),                   5, 1529.91, 4, DATEADD(HOUR, -1, GETDATE()), DATEADD(MINUTE, -30, GETDATE()));
    INSERT INTO dbo.daily_summary (id, summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
    (2, DATEADD(DAY, -1, CAST(GETDATE() AS DATE)), 8, 2245.88, 5, DATEADD(DAY, -1, GETDATE()),  DATEADD(HOUR, -23, GETDATE()));
    INSERT INTO dbo.daily_summary (id, summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
    (3, DATEADD(DAY, -2, CAST(GETDATE() AS DATE)), 12, 3456.78, 7, DATEADD(DAY, -2, GETDATE()), DATEADD(HOUR, -46, GETDATE()));
END;
GO

-- Insert user sessions
IF (SELECT COUNT(*) FROM dbo.user_sessions) = 0
BEGIN
    INSERT INTO dbo.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (1, 1, 'sess_abc123', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', DATEADD(HOUR, -2, GETDATE()),   DATEADD(MINUTE, -15, GETDATE()), DATEADD(MINUTE, -15, GETDATE()));
    INSERT INTO dbo.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (2, 2, 'sess_def456', '192.168.1.101', 'Mozilla/5.0 (Mac OS X) AppleWebKit/537.36',                   DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -30, GETDATE()), DATEADD(MINUTE, -30, GETDATE()));
    INSERT INTO dbo.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (3, 3, 'sess_ghi789', '192.168.1.102', 'Mozilla/5.0 (Linux; Android 10)',                              DATEADD(MINUTE, -30, GETDATE()),DATEADD(MINUTE, -10, GETDATE()), DATEADD(MINUTE, -10, GETDATE()));
    INSERT INTO dbo.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (4, 4, 'sess_jkl012', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',                     DATEADD(MINUTE, -45, GETDATE()),DATEADD(MINUTE, -20, GETDATE()), DATEADD(MINUTE, -20, GETDATE()));
    INSERT INTO dbo.user_sessions (id, user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (5, 5, 'sess_mno345', '192.168.1.104', 'Mozilla/5.0 (iPad; CPU OS 15_0)',                              DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -5, GETDATE()),  DATEADD(MINUTE, -5, GETDATE()));
END;
GO

-- Note: Synapse dedicated SQL pools use clustered columnstore indexes by default.
-- Traditional B-tree indexes on heap tables are also supported but not necessary
-- for small test datasets. For production, consider HASH distribution on high-
-- cardinality join keys (e.g. customer_id, order id).
