import json
import os
import shutil
import subprocess
import tempfile
import time

from core.base_engine import BaseEngine
from core.scan_utils import ensure_url, get_hostname


DEFAULT_TIMEOUT_SECONDS = 180
MAX_ITEMS = 500


class ExternalToolWrapper(BaseEngine):
    tool_name = ""
    install_hint = ""

    def tool_path(self):
        return shutil.which(self.tool_name)

    def unavailable_result(self):
        return {
            "tool": self.tool_name,
            "results": [],
            "total_results": 0,
            "install_hint": self.install_hint,
            "error": f"{self.tool_name} is not installed or is not available in PATH",
        }

    def run_command(self, command, timeout=DEFAULT_TIMEOUT_SECONDS):
        started_at = time.monotonic()

        try:
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return {
                "command": self._redacted_command(command),
                "stdout": "",
                "stderr": "",
                "returncode": None,
                "duration_seconds": round(time.monotonic() - started_at, 2),
                "error": f"{self.tool_name} timed out after {timeout} seconds",
            }

        return {
            "command": self._redacted_command(command),
            "stdout": completed.stdout or "",
            "stderr": completed.stderr or "",
            "returncode": completed.returncode,
            "duration_seconds": round(time.monotonic() - started_at, 2),
            "error": completed.stderr.strip() if completed.returncode != 0 else None,
        }

    def parse_json_lines(self, output):
        items = []
        for line in output.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                items.append(json.loads(line))
            except json.JSONDecodeError:
                items.append({"raw": line})
            if len(items) >= MAX_ITEMS:
                break
        return items

    def parse_json_document(self, output):
        if not output.strip():
            return None
        try:
            return json.loads(output)
        except json.JSONDecodeError:
            return None

    def _redacted_command(self, command):
        return " ".join(command)


class NucleiWrapper(ExternalToolWrapper):
    tool_name = "nuclei"
    install_hint = "Install ProjectDiscovery nuclei: https://github.com/projectdiscovery/nuclei"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        url = ensure_url(target)
        severity = kwargs.get("severity") or "info,low,medium,high,critical"
        templates = kwargs.get("templates")
        command = [
            path,
            "-u",
            url,
            "-jsonl",
            "-silent",
            "-severity",
            severity,
            "-timeout",
            str(int(kwargs.get("request_timeout") or 8)),
            "-retries",
            "1",
            "-no-color",
        ]

        if templates:
            command.extend(["-t", templates])

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or DEFAULT_TIMEOUT_SECONDS))
        findings = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "url": url,
            "severity_filter": severity,
            "findings": findings,
            "total_findings": len(findings),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class HttpxWrapper(ExternalToolWrapper):
    tool_name = "httpx"
    install_hint = "Install ProjectDiscovery httpx: https://github.com/projectdiscovery/httpx"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        url = ensure_url(target)
        command = [
            path,
            "-u",
            url,
            "-json",
            "-silent",
            "-tech-detect",
            "-status-code",
            "-title",
            "-server",
            "-cdn",
            "-ip",
            "-follow-redirects",
        ]

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 90))
        probes = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "url": url,
            "probes": probes,
            "total_probes": len(probes),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class NaabuWrapper(ExternalToolWrapper):
    tool_name = "naabu"
    install_hint = "Install ProjectDiscovery naabu: https://github.com/projectdiscovery/naabu"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        host = get_hostname(target)
        top_ports = str(kwargs.get("top_ports") or "1000")
        command = [
            path,
            "-host",
            host,
            "-json",
            "-silent",
            "-top-ports",
            top_ports,
        ]

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 180))
        open_ports = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "host": host,
            "top_ports": top_ports,
            "open_ports": open_ports,
            "total_open": len(open_ports),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class KatanaWrapper(ExternalToolWrapper):
    tool_name = "katana"
    install_hint = "Install ProjectDiscovery katana: https://github.com/projectdiscovery/katana"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        url = ensure_url(target)
        depth = str(int(kwargs.get("depth") or 2))
        command = [
            path,
            "-u",
            url,
            "-jsonl",
            "-silent",
            "-depth",
            depth,
            "-jc",
        ]

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 180))
        endpoints = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "url": url,
            "depth": depth,
            "endpoints": endpoints,
            "total_endpoints": len(endpoints),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class DnsxWrapper(ExternalToolWrapper):
    tool_name = "dnsx"
    install_hint = "Install ProjectDiscovery dnsx: https://github.com/projectdiscovery/dnsx"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        domain = get_hostname(target)
        command = [
            path,
            "-d",
            domain,
            "-a",
            "-aaaa",
            "-cname",
            "-mx",
            "-ns",
            "-txt",
            "-json",
            "-silent",
        ]

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 90))
        records = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "domain": domain,
            "records": records,
            "total_records": len(records),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class FfufWrapper(ExternalToolWrapper):
    tool_name = "ffuf"
    install_hint = "Install ffuf: https://github.com/ffuf/ffuf"
    DEFAULT_WORDS = (
        "admin",
        "api",
        "assets",
        "backup",
        "config",
        "dashboard",
        "debug",
        "dev",
        "docs",
        "graphql",
        "login",
        "old",
        "portal",
        "private",
        "server-status",
        "staging",
        "swagger",
        "test",
        ".env",
        ".git/HEAD",
    )

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        base_url = ensure_url(target).rstrip("/")
        words = kwargs.get("words") or self.DEFAULT_WORDS
        wordlist_path = self._write_wordlist(words)

        try:
            command = [
                path,
                "-u",
                f"{base_url}/FUZZ",
                "-w",
                wordlist_path,
                "-of",
                "json",
                "-s",
                "-mc",
                "200,204,301,302,307,308,401,403",
                "-t",
                str(int(kwargs.get("threads") or 20)),
            ]
            execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 120))
        finally:
            try:
                os.remove(wordlist_path)
            except OSError:
                pass

        parsed = self.parse_json_document(execution["stdout"]) or {}
        results = parsed.get("results") if isinstance(parsed, dict) else None
        results = results if isinstance(results, list) else []

        return {
            "tool": self.tool_name,
            "base_url": base_url,
            "results": results[:MAX_ITEMS],
            "total_results": len(results),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }

    def _write_wordlist(self, words):
        with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as handle:
            for word in words:
                handle.write(f"{word}\n")
            return handle.name


class ArchiveUrlsWrapper(ExternalToolWrapper):
    tool_name = "gau"
    install_hint = "Install gau or waybackurls: https://github.com/lc/gau or https://github.com/tomnomnom/waybackurls"

    def tool_path(self):
        return shutil.which("gau") or shutil.which("waybackurls")

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        domain = get_hostname(target)
        executable = os.path.basename(path).lower()
        command = [path, "--subs", domain] if executable.startswith("gau") else [path, domain]

        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 120))
        urls = []
        for line in execution["stdout"].splitlines():
            line = line.strip()
            if line:
                urls.append(line)
            if len(urls) >= MAX_ITEMS:
                break

        return {
            "tool": executable,
            "domain": domain,
            "urls": urls,
            "total_urls": len(urls),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class Wafw00fWrapper(ExternalToolWrapper):
    tool_name = "wafw00f"
    install_hint = "Install wafw00f: https://github.com/EnableSecurity/wafw00f"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        url = ensure_url(target)
        command = [path, url, "-a", "-f", "json"]
        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 90))
        parsed = self.parse_json_document(execution["stdout"])

        return {
            "tool": self.tool_name,
            "url": url,
            "result": parsed if parsed is not None else execution["stdout"].splitlines(),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }


class SubzyWrapper(ExternalToolWrapper):
    tool_name = "subzy"
    install_hint = "Install subzy: https://github.com/LukaSikic/subzy"

    def run(self, target, **kwargs):
        path = self.tool_path()
        if not path:
            return self.unavailable_result()

        host = get_hostname(target)
        command = [path, "run", "--target", host, "--hide_fails", "--json"]
        execution = self.run_command(command, timeout=int(kwargs.get("timeout") or 120))
        findings = self.parse_json_lines(execution["stdout"])

        return {
            "tool": self.tool_name,
            "host": host,
            "findings": findings,
            "total_findings": len(findings),
            "command": execution["command"],
            "duration_seconds": execution["duration_seconds"],
            "stderr": execution["stderr"],
            "error": execution["error"],
        }
