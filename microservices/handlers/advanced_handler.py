from engines.custom.dns_engine import DnsRecordsEngine
from engines.custom.web_recon_engine import (
    CorsAuditEngine,
    DirectoryDiscoveryEngine,
    HttpHeadersEngine,
    JsSecretScanEngine,
    SubdomainTakeoverEngine,
    TechnologyFingerprintEngine,
    WellKnownFilesEngine,
)
from engines.wrappers.external_tool_wrappers import (
    ArchiveUrlsWrapper,
    DnsxWrapper,
    FfufWrapper,
    HttpxWrapper,
    KatanaWrapper,
    NaabuWrapper,
    NucleiWrapper,
    SubzyWrapper,
    Wafw00fWrapper,
)
from handlers.generic_handler import run_scan_engine


def handle_dns_records_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "DNS Records Analysis", DnsRecordsEngine(), target, **kwargs)


def handle_http_headers_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "HTTP Security Headers Audit", HttpHeadersEngine(), target, **kwargs)


def handle_cors_audit_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "CORS Misconfiguration Audit", CorsAuditEngine(), target, **kwargs)


def handle_tech_stack_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Technology Fingerprinting", TechnologyFingerprintEngine(), target, **kwargs)


def handle_directory_discovery_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Directory and File Discovery", DirectoryDiscoveryEngine(), target, **kwargs)


def handle_well_known_files_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Well-Known Files Discovery", WellKnownFilesEngine(), target, **kwargs)


def handle_js_secret_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "JavaScript Secret Scan", JsSecretScanEngine(), target, **kwargs)


def handle_subdomain_takeover_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Subdomain Takeover Fingerprint Check", SubdomainTakeoverEngine(), target, **kwargs)


def handle_nuclei_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Nuclei Template Scan", NucleiWrapper(), target, **kwargs)


def handle_httpx_probe_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "HTTPX Web Probe", HttpxWrapper(), target, **kwargs)


def handle_naabu_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Naabu Port Discovery", NaabuWrapper(), target, **kwargs)


def handle_katana_crawl_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Katana Endpoint Crawl", KatanaWrapper(), target, **kwargs)


def handle_dnsx_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "DNSX DNS Resolution", DnsxWrapper(), target, **kwargs)


def handle_ffuf_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "FFUF Content Discovery", FfufWrapper(), target, **kwargs)


def handle_archive_urls_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Archive URL Discovery", ArchiveUrlsWrapper(), target, **kwargs)


def handle_waf_detection_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "WAF Detection", Wafw00fWrapper(), target, **kwargs)


def handle_subzy_scan(scan_id, target, **kwargs):
    run_scan_engine(scan_id, "Subzy Takeover Scan", SubzyWrapper(), target, **kwargs)
