import json
from config.db import update_scan_status, add_finding
from modules.ip.recon_module import recon_scan
from messaging.producer import addScantoResult
from modules.ip.port_module import port_scan


def handle_ip_ssl_scan(scan_id, target, **kwargs):

    ip = target.get("ip")
    update_scan_status(scan_id, "started")

    result = recon_scan(ip)

    try:
        finding_id = add_finding(scan_id, "Basic Recon and Intelligence", result)

        payload = json.dumps(
            {
                "scan_id": scan_id,
                "finding_id": finding_id,
                "status": "completed" if result["error"] is None else "failed",
                "error": result["error"] or "",
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


def handel_ip_port_scan(scan_id, target, **kwargs):
    ip = target.get("ip")
    protocol=kwargs.get("protocol") or "TCP"
    port_range=kwargs.get("port_range") or "basic"

    update_scan_status(scan_id, "started")

    result = port_scan(ip,protocol,port_range)

    try:
        finding_id = add_finding(scan_id, f"{protocol.upper()} scan, range {port_range}", result)

        payload = json.dumps(
            {
                "scan_id": scan_id,
                "finding_id": finding_id,
                "status": "completed" if result["error"] is None else "failed",
                "error": result["error"] or "",
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
