import socket

from core.base_engine import BaseEngine
from core.scan_utils import get_hostname

try:
    import dns.resolver
except ImportError:  # pragma: no cover - dependency is optional at runtime
    dns = None


class DnsRecordsEngine(BaseEngine):
    RECORD_TYPES = ("A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA", "CAA")

    def run(self, target, **kwargs):
        domain = get_hostname(target)
        records = {record_type: [] for record_type in self.RECORD_TYPES}
        errors = {}

        if not domain:
            return {"domain": domain, "records": records, "error": "Target is empty"}

        if dns is None:
            records["A"] = self._socket_records(domain, socket.AF_INET)
            records["AAAA"] = self._socket_records(domain, socket.AF_INET6)
            return {
                "domain": domain,
                "records": records,
                "errors": {
                    "resolver": "dnspython is not installed; only A/AAAA fallback was attempted"
                },
                "error": None,
            }

        resolver = dns.resolver.Resolver()
        resolver.lifetime = int(kwargs.get("timeout") or 5)
        resolver.timeout = int(kwargs.get("timeout") or 5)

        for record_type in self.RECORD_TYPES:
            try:
                answers = resolver.resolve(domain, record_type)
                records[record_type] = [self._format_answer(record_type, answer) for answer in answers]
            except Exception as exc:
                errors[record_type] = str(exc)

        return {
            "domain": domain,
            "records": records,
            "errors": errors,
            "summary": {key: len(value) for key, value in records.items()},
            "error": None,
        }

    def _socket_records(self, domain, family):
        try:
            results = socket.getaddrinfo(domain, None, family, socket.SOCK_STREAM)
            return sorted({item[4][0] for item in results})
        except socket.gaierror:
            return []

    def _format_answer(self, record_type, answer):
        if record_type == "MX":
            return {
                "preference": getattr(answer, "preference", None),
                "exchange": str(getattr(answer, "exchange", answer)).rstrip("."),
            }

        if record_type == "SOA":
            return {
                "mname": str(answer.mname).rstrip("."),
                "rname": str(answer.rname).rstrip("."),
                "serial": answer.serial,
                "refresh": answer.refresh,
                "retry": answer.retry,
                "expire": answer.expire,
                "minimum": answer.minimum,
            }

        if record_type == "TXT":
            return "".join(part.decode("utf-8", errors="replace") for part in answer.strings)

        return str(answer).rstrip(".")
