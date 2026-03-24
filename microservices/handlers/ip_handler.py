import json
from config.db import update_scan_status, add_finding
from modules.ip.recon_module import recon_scan
from messaging.producer import addScantoResult


def handle_ip_scan(scan_id, target):

    ip = target.get("url")
    update_scan_status(scan_id, "started")

    result = recon_scan(ip)

    try:
        finding_id = add_finding(scan_id, "IP Reconnaissance", result)

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
