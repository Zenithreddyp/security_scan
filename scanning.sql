CREATE TABLE targets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    target_url TEXT,
    target_ip INET,
    label TEXT[],

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT targets_url_or_ip_required
        CHECK (target_url IS NOT NULL OR target_ip IS NOT NULL)
);




CREATE TABLE scans (
    id UUID PRIMARY KEY,
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'queued',
    scan_type TEXT NOT NULL,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT scans_status_check
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled'))
);


CREATE TABLE findings (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    raw_data JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT findings_severity_check
        CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical'))
);









-- trigers 

CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled')
       AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.completed_at = now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_completed_at
BEFORE UPDATE ON scans
FOR EACH ROW
EXECUTE FUNCTION set_completed_at();







-- indexes

CREATE INDEX idx_targets_user_id
ON targets(user_id);

CREATE INDEX idx_targets_target_ip
ON targets(target_ip);

CREATE INDEX idx_scans_target_id
ON scans(target_id);

CREATE INDEX idx_scans_created_by
ON scans(created_by);

CREATE INDEX idx_scans_status
ON scans(status);

CREATE INDEX idx_findings_scan_id
ON findings(scan_id);

CREATE INDEX idx_findings_severity
ON findings(severity);
