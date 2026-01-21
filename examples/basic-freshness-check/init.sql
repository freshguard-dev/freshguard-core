-- Create sample tables for FreshGuard monitoring example

-- Orders table - demonstrates freshness monitoring
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events table - demonstrates volume anomaly detection
CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample orders data
INSERT INTO orders (customer_id, order_total, status, created_at, updated_at) VALUES
(1001, 99.99, 'completed', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),
(1002, 149.50, 'completed', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '40 minutes'),
(1003, 75.00, 'pending', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
(1004, 200.25, 'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes'),
(1005, 89.99, 'shipped', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
(1006, 125.75, 'pending', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes');

-- Insert sample events data (realistic volume for testing)
INSERT INTO user_events (user_id, event_type, event_data, timestamp)
SELECT
    (random() * 1000 + 1)::integer as user_id,
    CASE (random() * 4)::integer
        WHEN 0 THEN 'page_view'
        WHEN 1 THEN 'button_click'
        WHEN 2 THEN 'form_submit'
        ELSE 'user_login'
    END as event_type,
    jsonb_build_object('page', '/dashboard', 'source', 'web') as event_data,
    NOW() - (random() * INTERVAL '24 hours') as timestamp
FROM generate_series(1, 1000);

-- Add some more recent events to establish a baseline
INSERT INTO user_events (user_id, event_type, event_data, timestamp)
SELECT
    (random() * 1000 + 1)::integer as user_id,
    'page_view' as event_type,
    jsonb_build_object('page', '/home', 'source', 'mobile') as event_data,
    NOW() - (random() * INTERVAL '1 hour') as timestamp
FROM generate_series(1, 50);

-- Create indexes for better performance
CREATE INDEX idx_orders_updated_at ON orders(updated_at);
CREATE INDEX idx_events_timestamp ON user_events(timestamp);

-- Show sample data
SELECT 'Orders sample data:' as info;
SELECT id, customer_id, order_total, status, updated_at
FROM orders
ORDER BY updated_at DESC
LIMIT 5;

SELECT 'User events sample data:' as info;
SELECT user_id, event_type, timestamp
FROM user_events
ORDER BY timestamp DESC
LIMIT 5;