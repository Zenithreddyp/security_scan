import json

from core.db import add_finding, update_scan_status
from core.messaging.producer import addScantoResult


def run_scan_engine(scan_id, title, engine, target, **kwargs):
    update_scan_status(scan_id, "started")

    try:
        result = engine.run(target, **kwargs)
    except Exception as exc:
        result = {"error": str(exc)}

    error = result.get("error") if isinstance(result, dict) else None
    status = "failed" if error else "completed"

    try:
        finding_id = add_finding(scan_id, title, result)
        payload = json.dumps(
            {
                "scan_id": scan_id,
                "finding_id": finding_id,
                "status": status,
                "error": error or "",
            }
        )
        addScantoResult(payload)
        update_scan_status(scan_id, status)
    except Exception as exc:
        error_payload = json.dumps(
            {"scan_id": scan_id, "status": "failed", "error": str(exc)}
        )
        addScantoResult(error_payload)
        update_scan_status(scan_id, "failed")
