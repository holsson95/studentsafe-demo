ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_log_type_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_log_type_check
    CHECK (log_type IN ('case', 'user', 'auth'));
