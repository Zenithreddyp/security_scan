import json
from config.db import update_scan_status, add_finding
from modules.domain.ssl_module import ssl_scan
from messaging.producer import addScantoResult


def handle_ssl_scan(scan_id, target):
    hostname = target.get("url")

    update_scan_status(scan_id, "started")

    result = ssl_scan(hostname)

    try:
        finding_id = add_finding(scan_id, "SSL/TLS", result)

        payload = json.dumps(
            {
                "scan_id": scan_id,
                "finding_id": finding_id,
                "status": "completed" if result["error"] is None else "failed",
                "error": result["error"] or "",
            }
        )
        addScantoResult(payload)

    except Exception as e:
        error_payload = json.dumps(
            {"scan_id": scan_id, "status": "failed", "error": str(e)}
        )
        addScantoResult(error_payload)

        update_scan_status(scan_id, "failed")
