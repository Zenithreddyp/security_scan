from core.base_engine import BaseEngine
import ssl
import socket
from datetime import datetime, UTC
from cryptography import x509
from cryptography.hazmat.backends import default_backend

def parse_name(field):
    """Convert certificate subject/issuer tuple into dict"""
    result = {}
    for item in field:
        for key, value in item:
            result[key] = value
    return result

class SSLEngine(BaseEngine):
    def run(self, target, **kwargs):
        """Pure scan function: Returns a dictionary of results"""
        hostname = target
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

                    result["subject"] = parse_name(cert.get("subject", ()))
                    result["issuer"] = parse_name(cert.get("issuer", ()))

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
                    cert_obj = x509.load_der_x509_certificate(der_cert, default_backend())
                    result["signature_algorithm"] = cert_obj.signature_algorithm_oid._name

        except Exception as e:
            import traceback
            result["error"] = f"{str(e)}\n{traceback.format_exc()}"


        return result
