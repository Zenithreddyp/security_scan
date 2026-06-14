import re
from urllib.parse import urljoin

import requests

from core.base_engine import BaseEngine
from core.scan_utils import ensure_url, get_hostname


DEFAULT_TIMEOUT = 8
DEFAULT_HEADERS = {"User-Agent": "security-scan/1.0 authorized-research"}


def request_url(url, method="GET", **kwargs):
    timeout = int(kwargs.pop("timeout", DEFAULT_TIMEOUT))
    headers = dict(DEFAULT_HEADERS)
    headers.update(kwargs.pop("headers", {}) or {})
    return requests.request(
        method,
        url,
        headers=headers,
        timeout=timeout,
        allow_redirects=kwargs.pop("allow_redirects", True),
        **kwargs,
    )


class HttpHeadersEngine(BaseEngine):
    REQUIRED_HEADERS = {
        "strict-transport-security": {
            "severity": "medium",
            "description": "HSTS is missing; browsers may allow protocol downgrade attacks.",
        },
        "content-security-policy": {
            "severity": "medium",
            "description": "CSP is missing; XSS impact is usually easier to exploit.",
        },
        "x-frame-options": {
            "severity": "low",
            "description": "Clickjacking protection header is missing.",
        },
        "x-content-type-options": {
            "severity": "low",
            "description": "MIME sniffing protection header is missing.",
        },
        "referrer-policy": {
            "severity": "low",
            "description": "Referrer policy is missing.",
        },
        "permissions-policy": {
            "severity": "info",
            "description": "Permissions Policy is missing.",
        },
    }

    def run(self, target, **kwargs):
        url = ensure_url(target)

        try:
            response = request_url(url, method="GET", **kwargs)
        except Exception as exc:
            return {"url": url, "headers": {}, "missing": [], "findings": [], "error": str(exc)}

        normalized_headers = {key.lower(): value for key, value in response.headers.items()}
        missing = [key for key in self.REQUIRED_HEADERS if key not in normalized_headers]
        findings = [
            {
                "header": header,
                "severity": self.REQUIRED_HEADERS[header]["severity"],
                "description": self.REQUIRED_HEADERS[header]["description"],
            }
            for header in missing
        ]

        if "server" in normalized_headers:
            findings.append(
                {
                    "header": "server",
                    "severity": "info",
                    "description": f"Server banner exposed: {normalized_headers['server']}",
                }
            )

        return {
            "url": response.url,
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "missing": missing,
            "findings": findings,
            "total_findings": len(findings),
            "error": None,
        }


class CorsAuditEngine(BaseEngine):
    TEST_ORIGIN = "https://evil.example"

    def run(self, target, **kwargs):
        url = ensure_url(target)
        headers = {"Origin": kwargs.get("origin") or self.TEST_ORIGIN}

        try:
            response = request_url(url, method="GET", headers=headers, **kwargs)
        except Exception as exc:
            return {"url": url, "findings": [], "error": str(exc)}

        allow_origin = response.headers.get("Access-Control-Allow-Origin")
        allow_credentials = response.headers.get("Access-Control-Allow-Credentials")
        findings = []

        if allow_origin == "*":
            findings.append(
                {
                    "severity": "medium",
                    "description": "CORS allows every origin.",
                    "header": "Access-Control-Allow-Origin: *",
                }
            )

        if allow_origin == headers["Origin"] and allow_credentials == "true":
            findings.append(
                {
                    "severity": "high",
                    "description": "CORS reflects arbitrary origins while allowing credentials.",
                    "header": "Access-Control-Allow-Credentials: true",
                }
            )

        return {
            "url": response.url,
            "tested_origin": headers["Origin"],
            "access_control_allow_origin": allow_origin,
            "access_control_allow_credentials": allow_credentials,
            "findings": findings,
            "total_findings": len(findings),
            "error": None,
        }


class TechnologyFingerprintEngine(BaseEngine):
    SIGNATURES = {
        "WordPress": ("wp-content", "wp-includes"),
        "Drupal": ("drupal-settings-json", "Drupal.settings"),
        "Joomla": ("content=\"Joomla!", "/media/system/js/"),
        "React": ("__REACT_DEVTOOLS_GLOBAL_HOOK__", "data-reactroot"),
        "Next.js": ("__NEXT_DATA__", "_next/static"),
        "Nuxt": ("__NUXT__", "_nuxt/"),
        "Vue": ("data-v-", "__VUE__"),
        "Angular": ("ng-version", "ng-app"),
        "Laravel": ("laravel_session", "XSRF-TOKEN"),
        "Django": ("csrftoken", "django"),
    }

    def run(self, target, **kwargs):
        url = ensure_url(target)

        try:
            response = request_url(url, method="GET", **kwargs)
        except Exception as exc:
            return {"url": url, "technologies": [], "headers": {}, "error": str(exc)}

        body = response.text[:250000]
        headers = response.headers
        technologies = []

        server = headers.get("Server")
        powered_by = headers.get("X-Powered-By")

        if server:
            technologies.append({"name": server, "source": "Server header"})
        if powered_by:
            technologies.append({"name": powered_by, "source": "X-Powered-By header"})

        for name, signatures in self.SIGNATURES.items():
            if any(signature.lower() in body.lower() for signature in signatures):
                technologies.append({"name": name, "source": "HTML signature"})

        return {
            "url": response.url,
            "status_code": response.status_code,
            "title": self._extract_title(body),
            "technologies": technologies,
            "total_technologies": len(technologies),
            "headers": {
                "server": server,
                "x_powered_by": powered_by,
            },
            "error": None,
        }

    def _extract_title(self, body):
        match = re.search(r"<title[^>]*>(.*?)</title>", body, re.IGNORECASE | re.DOTALL)
        if not match:
            return None
        return re.sub(r"\s+", " ", match.group(1)).strip()


class DirectoryDiscoveryEngine(BaseEngine):
    DEFAULT_PATHS = (
        "admin",
        "login",
        "dashboard",
        "api",
        "api/v1",
        "swagger",
        "swagger-ui",
        "openapi.json",
        ".env",
        ".git/HEAD",
        ".well-known/security.txt",
        "robots.txt",
        "sitemap.xml",
        "backup.zip",
        "backup.tar.gz",
        "config.php",
        "phpinfo.php",
    )

    def run(self, target, **kwargs):
        base_url = ensure_url(target).rstrip("/") + "/"
        paths = kwargs.get("paths") or self.DEFAULT_PATHS
        max_paths = int(kwargs.get("max_paths") or 50)
        interesting = []
        errors = {}

        for path in list(paths)[:max_paths]:
            url = urljoin(base_url, path.lstrip("/"))
            try:
                response = request_url(url, method="GET", allow_redirects=False, **kwargs)
            except Exception as exc:
                errors[path] = str(exc)
                continue

            if response.status_code in (200, 204, 301, 302, 307, 308, 401, 403):
                interesting.append(
                    {
                        "path": "/" + path.lstrip("/"),
                        "url": url,
                        "status_code": response.status_code,
                        "content_length": len(response.content or b""),
                        "severity": self._severity(path, response.status_code),
                    }
                )

        return {
            "base_url": base_url,
            "checked_paths": min(len(paths), max_paths),
            "interesting_paths": interesting,
            "total_interesting": len(interesting),
            "errors": errors,
            "error": None,
        }

    def _severity(self, path, status_code):
        lower_path = path.lower()
        if lower_path in (".env", ".git/head", "config.php", "phpinfo.php") and status_code == 200:
            return "high"
        if status_code in (401, 403):
            return "info"
        return "low"


class WellKnownFilesEngine(BaseEngine):
    FILES = (
        "robots.txt",
        "sitemap.xml",
        ".well-known/security.txt",
        ".well-known/change-password",
        ".well-known/assetlinks.json",
    )

    def run(self, target, **kwargs):
        base_url = ensure_url(target).rstrip("/") + "/"
        found = []

        for path in self.FILES:
            url = urljoin(base_url, path)
            try:
                response = request_url(url, method="GET", allow_redirects=False, **kwargs)
            except Exception:
                continue

            if response.status_code in (200, 204, 301, 302, 307, 308):
                found.append(
                    {
                        "path": "/" + path,
                        "url": url,
                        "status_code": response.status_code,
                        "content_preview": response.text[:500] if response.text else "",
                    }
                )

        return {
            "base_url": base_url,
            "files": found,
            "total_files": len(found),
            "error": None,
        }


class JsSecretScanEngine(BaseEngine):
    SECRET_PATTERNS = {
        "AWS Access Key": r"AKIA[0-9A-Z]{16}",
        "Google API Key": r"AIza[0-9A-Za-z\-_]{35}",
        "Slack Token": r"xox[baprs]-[0-9A-Za-z-]{10,48}",
        "Private Key": r"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----",
        "JWT": r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
    }
    SCRIPT_RE = re.compile(r"<script[^>]+src=[\"']([^\"']+)[\"']", re.IGNORECASE)

    def run(self, target, **kwargs):
        url = ensure_url(target)

        try:
            response = request_url(url, method="GET", **kwargs)
        except Exception as exc:
            return {"url": url, "scripts": [], "findings": [], "error": str(exc)}

        script_urls = [urljoin(response.url, src) for src in self.SCRIPT_RE.findall(response.text)]
        max_scripts = int(kwargs.get("max_scripts") or 15)
        findings = []
        scanned = []

        for script_url in script_urls[:max_scripts]:
            scanned.append(script_url)
            try:
                script_response = request_url(script_url, method="GET", **kwargs)
            except Exception:
                continue

            for name, pattern in self.SECRET_PATTERNS.items():
                for match in re.finditer(pattern, script_response.text):
                    findings.append(
                        {
                            "type": name,
                            "url": script_url,
                            "match_preview": self._mask(match.group(0)),
                            "severity": "high" if name != "JWT" else "medium",
                        }
                    )

        return {
            "url": response.url,
            "scripts_discovered": len(script_urls),
            "scripts_scanned": scanned,
            "findings": findings,
            "total_findings": len(findings),
            "error": None,
        }

    def _mask(self, value):
        if len(value) <= 10:
            return "***"
        return f"{value[:5]}...{value[-4:]}"


class SubdomainTakeoverEngine(BaseEngine):
    FINGERPRINTS = {
        "github.io": "There isn't a GitHub Pages site here.",
        "herokuapp.com": "no such app",
        "amazonaws.com": "NoSuchBucket",
        "azurewebsites.net": "404 Web Site not found",
        "readme.io": "Project doesnt exist",
        "surge.sh": "project not found",
        "bitbucket.io": "Repository not found",
    }

    def run(self, target, **kwargs):
        host = get_hostname(target)
        url = ensure_url(host)
        findings = []

        try:
            response = request_url(url, method="GET", **kwargs)
            body = response.text[:100000].lower()
        except Exception as exc:
            return {"host": host, "findings": [], "error": str(exc)}

        for service, fingerprint in self.FINGERPRINTS.items():
            if service in host or fingerprint.lower() in body:
                findings.append(
                    {
                        "service": service,
                        "severity": "high",
                        "description": "Potential dangling service fingerprint detected.",
                    }
                )

        return {
            "host": host,
            "url": response.url,
            "findings": findings,
            "total_findings": len(findings),
            "error": None,
        }
