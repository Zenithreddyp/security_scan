export const SCAN_TYPES = {
    IP_RECON: {
        label: "IP Reconnaissance",
        targets: ["ip"],
    },
    "SSL/TLS": {
        label: "SSL / TLS Analysis",
        targets: ["domain"],
    },
    IP_PORT_SCAN: {
        label: "Nmap Port Scan",
        targets: ["ip", "domain"],
    },
    SUBDOMAIN_ENUM: {
        label: "Subfinder Subdomain Enumeration",
        targets: ["domain"],
    },
    DNS_RECORDS: {
        label: "DNS Records Analysis",
        targets: ["domain"],
    },
    HTTP_HEADERS: {
        label: "HTTP Security Headers Audit",
        targets: ["ip", "domain"],
    },
    CORS_AUDIT: {
        label: "CORS Misconfiguration Audit",
        targets: ["ip", "domain"],
    },
    TECH_STACK: {
        label: "Technology Fingerprinting",
        targets: ["ip", "domain"],
    },
    DIRECTORY_DISCOVERY: {
        label: "Directory and File Discovery",
        targets: ["ip", "domain"],
    },
    WELL_KNOWN_FILES: {
        label: "Well-Known Files Discovery",
        targets: ["domain"],
    },
    JS_SECRET_SCAN: {
        label: "JavaScript Secret Scan",
        targets: ["ip", "domain"],
    },
    SUBDOMAIN_TAKEOVER: {
        label: "Subdomain Takeover Fingerprint Check",
        targets: ["domain"],
    },
    NUCLEI_SCAN: {
        label: "Nuclei Template Scan",
        targets: ["ip", "domain"],
    },
    HTTPX_PROBE: {
        label: "HTTPX Web Probe",
        targets: ["ip", "domain"],
    },
    NAABU_SCAN: {
        label: "Naabu Port Discovery",
        targets: ["ip", "domain"],
    },
    KATANA_CRAWL: {
        label: "Katana Endpoint Crawl",
        targets: ["ip", "domain"],
    },
    DNSX_LOOKUP: {
        label: "DNSX DNS Resolution",
        targets: ["domain"],
    },
    FFUF_CONTENT_DISCOVERY: {
        label: "FFUF Content Discovery",
        targets: ["ip", "domain"],
    },
    ARCHIVE_URLS: {
        label: "Archive URL Discovery",
        targets: ["domain"],
    },
    WAF_DETECTION: {
        label: "WAF Detection",
        targets: ["ip", "domain"],
    },
    SUBZY_TAKEOVER: {
        label: "Subzy Takeover Scan",
        targets: ["domain"],
    },
};

export function scanTypesForTarget(targetType) {
    return Object.entries(SCAN_TYPES)
        .filter(([, config]) => config.targets.includes(targetType))
        .map(([key]) => key);
}

export function isScanAllowedForTarget(scanType, targetType) {
    return Boolean(SCAN_TYPES[scanType]?.targets.includes(targetType));
}
