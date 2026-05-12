import json
from core.db import update_scan_status, add_finding
from core.messaging.producer import addScantoResult
from engines.wrappers.subfinder_wrapper import SubfinderWrapper


def handle_subdomain_scan(scan_id, target, **kwargs):
    url = target.get("url") or target.get("ip")
    update_scan_status(scan_id, "started")

    result = SubfinderWrapper().run(url)

    try:
        finding_id = add_finding(scan_id, "Subdomain Enumeration", result)

        payload = json.dumps(
            {
                "scan_id": scan_id,
                "finding_id": finding_id,
                "status": "completed" if result.get("error") is None else "failed",
                "error": result.get("error") or "",
            }
        )
        addScantoResult(payload)
        update_scan_status(scan_id, "completed")

    except Exception as e:
        error_payload = json.dumps(
            {"scan_id": scan_id, "status": "failed", "error": str(e)}
        )
        addScantoResult(error_payload)

        update_scan_status(scan_id, "failed")
