-- Database initialization script for MSSQL integration tests
-- Creates test tables and inserts realistic test data
-- Uses T-SQL syntax compatible with SQL Server 2019+

USE freshguard_test;
GO

-- Create customers table
IF OBJECT_ID('dbo.customers', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.customers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;
GO

-- Create products table
IF OBJECT_ID('dbo.products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;
GO

-- Create orders table
IF OBJECT_ID('dbo.orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        customer_id INT REFERENCES dbo.customers(id),
        product_id INT REFERENCES dbo.products(id),
        quantity INT NOT NULL DEFAULT 1,
        total_amount DECIMAL(10, 2) NOT NULL,
        status NVARCHAR(50) DEFAULT 'pending',
        order_date DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;
GO

-- Create daily_summary table
IF OBJECT_ID('dbo.daily_summary', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.daily_summary (
        id INT IDENTITY(1,1) PRIMARY KEY,
        summary_date DATE NOT NULL,
        total_orders INT NOT NULL DEFAULT 0,
        total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
        unique_customers INT NOT NULL DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;
GO

-- Create user_sessions table
IF OBJECT_ID('dbo.user_sessions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.user_sessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        session_token NVARCHAR(255) NOT NULL UNIQUE,
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(MAX),
        started_at DATETIME2 DEFAULT GETDATE(),
        last_activity DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;
GO

-- Insert test customers
IF NOT EXISTS (SELECT 1 FROM dbo.customers)
BEGIN
    INSERT INTO dbo.customers (name, email, created_at, updated_at) VALUES
    ('John Doe',       'john@example.com',    DATEADD(DAY, -2, GETDATE()),    DATEADD(HOUR, -1, GETDATE())),
    ('Jane Smith',     'jane@example.com',    DATEADD(DAY, -1, GETDATE()),    DATEADD(HOUR, -2, GETDATE())),
    ('Bob Wilson',     'bob@example.com',     DATEADD(HOUR, -3, GETDATE()),   DATEADD(HOUR, -1, GETDATE())),
    ('Alice Johnson',  'alice@example.com',   DATEADD(DAY, -1, GETDATE()),    DATEADD(MINUTE, -30, GETDATE())),
    ('Charlie Brown',  'charlie@example.com', DATEADD(HOUR, -4, GETDATE()),   DATEADD(MINUTE, -15, GETDATE()));
END;
GO

-- Insert test products
IF NOT EXISTS (SELECT 1 FROM dbo.products)
BEGIN
    INSERT INTO dbo.products (name, price, category, created_at, updated_at) VALUES
    ('Laptop',   999.99, 'Electronics', DATEADD(DAY, -1, GETDATE()),  DATEADD(HOUR, -2, GETDATE())),
    ('Mouse',     29.99, 'Electronics', DATEADD(DAY, -2, GETDATE()),  DATEADD(HOUR, -1, GETDATE())),
    ('Keyboard',  79.99, 'Electronics', DATEADD(DAY, -1, GETDATE()),  DATEADD(MINUTE, -30, GETDATE())),
    ('Monitor',  249.99, 'Electronics', DATEADD(HOUR, -3, GETDATE()), DATEADD(HOUR, -1, GETDATE())),
    ('Webcam',    89.99, 'Electronics', DATEADD(DAY, -2, GETDATE()),  DATEADD(MINUTE, -45, GETDATE()));
END;
GO

-- Insert test orders
IF NOT EXISTS (SELECT 1 FROM dbo.orders)
BEGIN
    INSERT INTO dbo.orders (customer_id, product_id, quantity, total_amount, status, order_date, updated_at) VALUES
    (1, 1, 1, 999.99, 'completed', DATEADD(HOUR, -2, GETDATE()),   DATEADD(HOUR, -1, GETDATE())),
    (2, 2, 2,  59.98, 'pending',   DATEADD(MINUTE, -30, GETDATE()),DATEADD(MINUTE, -15, GETDATE())),
    (3, 3, 1,  79.99, 'completed', DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -30, GETDATE())),
    (1, 4, 1, 249.99, 'shipped',   DATEADD(HOUR, -3, GETDATE()),   DATEADD(HOUR, -1, GETDATE())),
    (4, 5, 1,  89.99, 'completed', DATEADD(MINUTE, -45, GETDATE()),DATEADD(MINUTE, -20, GETDATE())),
    (2, 1, 1, 999.99, 'pending',   DATEADD(MINUTE, -10, GETDATE()),DATEADD(MINUTE, -5, GETDATE())),
    (5, 2, 3,  89.97, 'completed', DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -45, GETDATE())),
    (3, 3, 2, 159.98, 'shipped',   DATEADD(HOUR, -2, GETDATE()),   DATEADD(MINUTE, -30, GETDATE()));
END;
GO

-- Insert daily summary data
IF NOT EXISTS (SELECT 1 FROM dbo.daily_summary)
BEGIN
    INSERT INTO dbo.daily_summary (summary_date, total_orders, total_revenue, unique_customers, created_at, updated_at) VALUES
    (CAST(GETDATE() AS DATE),                   5, 1529.91, 4, DATEADD(HOUR, -1, GETDATE()), DATEADD(MINUTE, -30, GETDATE())),
    (DATEADD(DAY, -1, CAST(GETDATE() AS DATE)), 8, 2245.88, 5, DATEADD(DAY, -1, GETDATE()),  DATEADD(HOUR, -23, GETDATE())),
    (DATEADD(DAY, -2, CAST(GETDATE() AS DATE)), 12, 3456.78, 7, DATEADD(DAY, -2, GETDATE()), DATEADD(HOUR, -46, GETDATE()));
END;
GO

-- Insert user sessions
IF NOT EXISTS (SELECT 1 FROM dbo.user_sessions)
BEGIN
    INSERT INTO dbo.user_sessions (user_id, session_token, ip_address, user_agent, started_at, last_activity, updated_at) VALUES
    (1, 'sess_abc123', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', DATEADD(HOUR, -2, GETDATE()),   DATEADD(MINUTE, -15, GETDATE()), DATEADD(MINUTE, -15, GETDATE())),
    (2, 'sess_def456', '192.168.1.101', 'Mozilla/5.0 (Mac OS X) AppleWebKit/537.36',                   DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -30, GETDATE()), DATEADD(MINUTE, -30, GETDATE())),
    (3, 'sess_ghi789', '192.168.1.102', 'Mozilla/5.0 (Linux; Android 10)',                              DATEADD(MINUTE, -30, GETDATE()),DATEADD(MINUTE, -10, GETDATE()), DATEADD(MINUTE, -10, GETDATE())),
    (4, 'sess_jkl012', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',                     DATEADD(MINUTE, -45, GETDATE()),DATEADD(MINUTE, -20, GETDATE()), DATEADD(MINUTE, -20, GETDATE())),
    (5, 'sess_mno345', '192.168.1.104', 'Mozilla/5.0 (iPad; CPU OS 15_0)',                              DATEADD(HOUR, -1, GETDATE()),   DATEADD(MINUTE, -5, GETDATE()),  DATEADD(MINUTE, -5, GETDATE()));
END;
GO

-- Create indexes for performance
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_orders_updated_at')
    CREATE INDEX idx_orders_updated_at ON dbo.orders(updated_at);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_user_sessions_updated_at')
    CREATE INDEX idx_user_sessions_updated_at ON dbo.user_sessions(updated_at);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_customers_updated_at')
    CREATE INDEX idx_customers_updated_at ON dbo.customers(updated_at);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_products_updated_at')
    CREATE INDEX idx_products_updated_at ON dbo.products(updated_at);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_daily_summary_updated_at')
    CREATE INDEX idx_daily_summary_updated_at ON dbo.daily_summary(updated_at);
GO
