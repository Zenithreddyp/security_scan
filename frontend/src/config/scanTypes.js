export const SCAN_TYPES = [
  { value: 'IP_RECON', label: 'IP Reconnaissance', alias: 'ip-recon', category: 'Network', requiresAuth: false },
  { value: 'SSL/TLS', label: 'SSL / TLS Analysis', alias: 'ssl-check', category: 'Web', requiresAuth: false },
  { value: 'IP_PORT_SCAN', label: 'Nmap Port Scan', alias: 'port-scan', category: 'Network', requiresAuth: true },
  { value: 'SUBDOMAIN_ENUM', label: 'Subfinder Subdomain Enumeration', alias: 'subdomain-enum', category: 'Domain', requiresAuth: true },
  { value: 'DNS_RECORDS', label: 'DNS Records Analysis', alias: 'dns-records', category: 'Domain', requiresAuth: true },
  { value: 'HTTP_HEADERS', label: 'HTTP Security Headers Audit', alias: 'http-headers', category: 'Web', requiresAuth: true },
  { value: 'CORS_AUDIT', label: 'CORS Misconfiguration Audit', alias: 'cors-audit', category: 'Web', requiresAuth: true },
  { value: 'TECH_STACK', label: 'Technology Fingerprinting', alias: 'tech-stack', category: 'Web', requiresAuth: true },
  { value: 'DIRECTORY_DISCOVERY', label: 'Directory and File Discovery', alias: 'directory-discovery', category: 'Content', requiresAuth: true },
  { value: 'WELL_KNOWN_FILES', label: 'Well-Known Files Discovery', alias: 'well-known-files', category: 'Content', requiresAuth: true },
  { value: 'JS_SECRET_SCAN', label: 'JavaScript Secret Scan', alias: 'js-secret-scan', category: 'Web', requiresAuth: true },
  { value: 'SUBDOMAIN_TAKEOVER', label: 'Subdomain Takeover Fingerprints', alias: 'subdomain-takeover', category: 'Domain', requiresAuth: true },
  { value: 'NUCLEI_SCAN', label: 'Nuclei Template Scan', alias: 'nuclei', category: 'Vulnerability', requiresAuth: true },
  { value: 'HTTPX_PROBE', label: 'HTTPX Web Probe', alias: 'httpx', category: 'Web', requiresAuth: true },
  { value: 'NAABU_SCAN', label: 'Naabu Port Discovery', alias: 'naabu', category: 'Network', requiresAuth: true },
  { value: 'KATANA_CRAWL', label: 'Katana Endpoint Crawl', alias: 'katana', category: 'Content', requiresAuth: true },
  { value: 'DNSX_LOOKUP', label: 'DNSX Lookup', alias: 'dnsx', category: 'Domain', requiresAuth: true },
  { value: 'FFUF_CONTENT_DISCOVERY', label: 'FFUF Content Discovery', alias: 'ffuf', category: 'Content', requiresAuth: true },
  { value: 'ARCHIVE_URLS', label: 'Archive URL Discovery', alias: 'archive-urls', category: 'Content', requiresAuth: true },
  { value: 'WAF_DETECTION', label: 'WAF Detection', alias: 'waf-detection', category: 'Web', requiresAuth: true },
  { value: 'SUBZY_TAKEOVER', label: 'Subzy Takeover Scan', alias: 'subzy', category: 'Domain', requiresAuth: true },
];

export const SCAN_TYPE_MAP = Object.fromEntries(SCAN_TYPES.map((scan) => [scan.value, scan.alias]));
export const SCAN_LABEL_MAP = Object.fromEntries(SCAN_TYPES.map((scan) => [scan.value, scan.label]));
export const SCAN_REQUIRES_AUTH = Object.fromEntries(SCAN_TYPES.map((scan) => [scan.value, scan.requiresAuth]));
