from urllib.parse import urlparse


def get_target_value(target):
    return target.get("url") or target.get("ip") or ""


def ensure_url(target, default_scheme="https"):
    value = target if isinstance(target, str) else get_target_value(target)
    value = (value or "").strip()

    if not value:
        return value

    parsed = urlparse(value)
    if parsed.scheme:
        return value

    return f"{default_scheme}://{value}"


def get_hostname(target):
    value = target if isinstance(target, str) else get_target_value(target)
    value = (value or "").strip()

    if not value:
        return value

    parsed = urlparse(value if "://" in value else f"//{value}")
    host = parsed.hostname or value

    if host.startswith("www."):
        return host[4:]

    return host


def first_present(*values, default=None):
    for value in values:
        if value is not None and value != "":
            return value
    return default
