import ssl
import socket
import json
from datetime import datetime, UTC
from cryptography import x509
from cryptography.hazmat.backends import default_backend

from config.db import add_finding
from worker2 import addScantoResult


def parse_name(field):
    """Convert certificate subject/issuer tuple into dict"""
    result = {}
    for item in field:
        for key, value in item:
            result[key] = value
    return result



def ssl_scan(scan_id, hostname):
    context = ssl.create_default_context()

    result = {
        "hostname": hostname,
        "subject": {},
        "issuer": {},
        "san": [],
        "valid_from": None,
        "valid_until": None,
        "days_left": None,
        "serial_number": None,
        "signature_algorithm": None,
        "error": None,
    }

    try:
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:

                cert = ssock.getpeercert()

                subject = parse_name(cert.get("subject", ()))
                issuer = parse_name(cert.get("issuer", ()))

                result["subject"] = subject
                result["issuer"] = issuer

                san_list = cert.get("subjectAltName", [])
                result["san"] = [x[1] for x in san_list]

                not_before = datetime.strptime(
                    cert["notBefore"], "%b %d %H:%M:%S %Y %Z"
                ).replace(tzinfo=UTC)
                not_after = datetime.strptime(
                    cert["notAfter"], "%b %d %H:%M:%S %Y %Z"
                ).replace(tzinfo=UTC)

                result["valid_from"] = not_before.isoformat()
                result["valid_until"] = not_after.isoformat()

                result["days_left"] = (not_after - datetime.now(UTC)).days

                result["serial_number"] = cert.get("serialNumber")
                der_cert = ssock.getpeercert(binary_form=True)
                cert = x509.load_der_x509_certificate(der_cert, default_backend())
                result["signature_algorithm"] = cert.signature_algorithm_oid._name

    except Exception as e:
        result["error"] = str(e)

    try:
        finding_id = add_finding(scan_id, "TLS/SSL", result)
        addScantoResult(
            json.dumps(
                {
                    "scan_id": scan_id,
                    "finding_id": finding_id,  
                    "status": "completed" if result["error"] is None else "failed",
                    "error": result["error"] or "",
                }
            )
        )

    except Exception as e:
        addScantoResult(
            json.dumps({"scan_id": scan_id, "status": "failed", "error": str(e)})
        )
