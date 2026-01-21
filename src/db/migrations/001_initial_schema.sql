-- FreshGuard Core - Initial Single-Tenant Schema
-- Migration 001: Create core monitoring tables
-- Created: 2026-01-21

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- Data Sources (Customer Databases)
-- ==============================================

CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic information
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,

  -- Connection details
  host VARCHAR(255),
  port INTEGER,
  database_name VARCHAR(255),
  username VARCHAR(255),

  -- Credentials (encrypted in production)
  password VARCHAR(255),
  encrypted_credentials TEXT,
  credentials_key_id VARCHAR(255),

  -- Additional connection options
  connection_options JSONB DEFAULT '{}',

  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMP,
  last_test_success BOOLEAN,
  last_error TEXT,

  -- Metadata
  table_count INTEGER,
  estimated_size_bytes BIGINT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Monitoring Rules Configuration
-- ==============================================

CREATE TABLE monitoring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,

  -- Rule identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  table_name VARCHAR(255) NOT NULL,

  -- Rule type and configuration
  rule_type VARCHAR(50) NOT NULL,

  -- Freshness monitoring settings
  expected_frequency VARCHAR(50),
  tolerance_minutes INTEGER,
  timestamp_column VARCHAR(255) DEFAULT 'updated_at',

  -- Volume anomaly settings
  baseline_window_days INTEGER DEFAULT 30,
  deviation_threshold_percent INTEGER DEFAULT 20,
  minimum_row_count INTEGER DEFAULT 0,

  -- Schema change settings
  track_column_changes BOOLEAN DEFAULT false,
  track_table_changes BOOLEAN DEFAULT false,

  -- Custom SQL rule (future)
  custom_sql TEXT,
  expected_result JSONB,

  -- Scheduling
  check_interval_minutes INTEGER DEFAULT 5,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_check_at TIMESTAMP,
  last_status VARCHAR(20) DEFAULT 'pending',
  consecutive_failures INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Alert Configuration
-- ==============================================

CREATE TABLE alert_destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES monitoring_rules(id) ON DELETE CASCADE,

  -- Destination configuration
  destination_type VARCHAR(50) NOT NULL,
  destination_address VARCHAR(500) NOT NULL,

  -- Alert settings
  severity_level VARCHAR(20) DEFAULT 'medium',
  alert_on_recovery BOOLEAN DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 5,

  -- Formatting options
  message_template TEXT,
  include_query_results BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Execution History & Results
-- ==============================================

CREATE TABLE check_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES monitoring_rules(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,

  -- Execution metadata
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  query_executed TEXT,
  execution_duration_ms INTEGER,

  -- Results (NEVER store actual customer data, only metadata)
  row_count BIGINT,
  last_update TIMESTAMP,
  lag_minutes INTEGER,

  -- Volume anomaly specific results
  baseline_average NUMERIC(15,2),
  current_deviation_percent NUMERIC(5,2),

  -- Schema change specific results
  schema_changes JSONB,

  -- Execution timing
  executed_at TIMESTAMP DEFAULT NOW(),
  next_check_at TIMESTAMP
);

-- ==============================================
-- Alert Dispatch Log
-- ==============================================

CREATE TABLE alert_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES check_executions(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES monitoring_rules(id) ON DELETE CASCADE,

  -- Alert details
  alert_type VARCHAR(50) NOT NULL,
  destination_type VARCHAR(50) NOT NULL,
  destination_address VARCHAR(500) NOT NULL,

  -- Message content
  subject VARCHAR(255),
  message_content TEXT,
  alert_severity VARCHAR(20) NOT NULL,

  -- Delivery status
  status VARCHAR(20) DEFAULT 'pending',
  delivery_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  error_message TEXT,
  external_id VARCHAR(255),

  -- Timing
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Audit & Compliance Logging
-- ==============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Action details
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,

  -- Change details
  old_values JSONB,
  new_values JSONB,

  -- Request context
  ip_address INET,
  user_agent TEXT,
  api_endpoint VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- System Configuration
-- ==============================================

CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  data_type VARCHAR(20) DEFAULT 'string',
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Schema Migrations
-- ==============================================

CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- Indexes for Performance
-- ==============================================

-- Data sources
CREATE INDEX idx_data_sources_type ON data_sources(type);
CREATE INDEX idx_data_sources_active ON data_sources(is_active);

-- Monitoring rules
CREATE INDEX idx_monitoring_rules_source_id ON monitoring_rules(source_id);
CREATE INDEX idx_monitoring_rules_active ON monitoring_rules(is_active);
CREATE INDEX idx_monitoring_rules_type ON monitoring_rules(rule_type);
CREATE INDEX idx_monitoring_rules_next_check ON monitoring_rules(last_check_at) WHERE is_active = true;

-- Check executions (for historical analysis)
CREATE INDEX idx_check_executions_rule_id ON check_executions(rule_id);
CREATE INDEX idx_check_executions_executed_at ON check_executions(executed_at);
CREATE INDEX idx_check_executions_status ON check_executions(status);

-- Alert log
CREATE INDEX idx_alert_log_rule_id ON alert_log(rule_id);
CREATE INDEX idx_alert_log_status ON alert_log(status);
CREATE INDEX idx_alert_log_created_at ON alert_log(created_at);

-- Audit log
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ==============================================
-- Insert Initial Migration Record
-- ==============================================

INSERT INTO schema_migrations (version, name)
VALUES (1, 'Initial single-tenant schema');

-- ==============================================
-- Default System Configuration
-- ==============================================

INSERT INTO system_config (key, value, description, data_type) VALUES
('app_version', '0.1.0', 'FreshGuard Core version', 'string'),
('default_check_interval', '5', 'Default check interval in minutes', 'integer'),
('max_concurrent_checks', '10', 'Maximum concurrent check executions', 'integer'),
('retention_days_executions', '90', 'Days to retain check execution history', 'integer'),
('retention_days_alerts', '30', 'Days to retain alert log entries', 'integer'),
('enable_audit_log', 'true', 'Enable audit logging', 'boolean'),
('default_timezone', 'UTC', 'Default timezone for scheduling', 'string');

-- ==============================================
-- Success Message
-- ==============================================

\echo 'FreshGuard Core database schema initialized successfully!'
\echo 'Schema version: 1'
\echo 'Tables created:'
\echo '  - data_sources: Store database connection info'
\echo '  - monitoring_rules: Configure monitoring rules'
\echo '  - alert_destinations: Configure alert endpoints'
\echo '  - check_executions: Store execution history'
\echo '  - alert_log: Track alert delivery'
\echo '  - audit_log: Audit trail'
\echo '  - system_config: System configuration'
\echo '  - schema_migrations: Track schema versions'
\echo ''
\echo 'Next steps:'
\echo '  1. Configure your data sources'
\echo '  2. Create monitoring rules'
\echo '  3. Set up alert destinations'
\echo '  4. Start monitoring!'