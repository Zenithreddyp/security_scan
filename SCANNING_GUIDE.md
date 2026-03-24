

## IP

### A. Basic Recon and Intelligence
* rDNS - get hostname
* WHOIS - owner, ISP, contact
* ASN - cloud provider / organization
* Geolocation
* Blacklist check
* BGP Hijacking/Leak Check - opt

### B. Port & Service Scanning Core
* TCP SYN scan
* Full port scan
* UDP scan
* Service detection
* Banner grabbing
* SNI (Server Name Indication) Probing - opt

### C. OS & Device Fingerprinting
* OS detection (Linux / Windows / BSD)
* Device type

### D. Vulnerability Mapping
* Match detected services → CVE database

### E. Misconfiguration Checks
* Open sensitive ports
* Anonymous login
* Default credentials

### F. Network-Level Insights
* Traceroute (path to host)
* Latency / uptime
* Firewall detection (filtered ports) 
* Honeypot detection - opt
* ICMP Type Variety - opt

---

## Domain

### A. DNS & Domain Intelligence
* A / AAAA records → IPs
* MX → mail servers
* TXT → SPF, DKIM, DMARC
* NS → nameservers
* Subdomain enumeration

### B. Web Server & Tech Stack Detection
* Server: Apache / Nginx / IIS
* Backend: PHP / Node / Python
* CMS detection

### C. SSL/TLS Security Scan
* Certificate validity
* Expiry date
* Weak ciphers
* TLS versions
* HSTS

### D. Web Vulnerability Scanning
* SQLi, XSS, CSRF, Open Redirect, File Inclusion (LFI/RFI), Directory traversal
* OWASP ZAP
* Burp Suite
* WAF Fingerprinting - opt
* CORS & PostMessage Misconfigurations - opt
* Cloud Metadata Exploitation (SSRF Goal)

### E. Content & Exposure Scanning
* Hidden directories: /admin, /backup
* Sensitive files: .env, .git
* API endpoints discovery

### F. Secrets & Leak Detection
* API keys in JS files
* Hardcoded credentials
* Exposed tokens

### G. Dependency & Library Scanning
* JS libraries (e.g., jQuery outdated)
* CVEs in frontend/backend libs

### H. Cloud Misconfiguration (if applicable)
* Public S3 buckets
* Open storage
* Misconfigured permissions

### I. Subdomain Takeover Check
* Dangling DNS records
* Unclaimed services

---

## Identity & Perimeter Intelligence (NEW – Critical in 2026)

### A. Email Discovery
* Pattern discovery (e.g., firstname.lastname@domain.com)
* Tools: Hunter, Phonebook

### B. Breached Credential Check
* Cross-check emails with leaked databases
* Identify reusable passwords

### C. MFA & Auth Weakness Analysis
* Check MFA enforcement
* Detect legacy protocol bypass: SMTP, IMAP

### D. Code Repository Recon
* GitHub / GitLab org scanning
* Look for: API keys, Secrets, Internal endpoints

---


## Process Flows
* **IP Flow:** IP → Port Scan → Service Detection → CVE Mapping → Report
* **Domain Flow:** Domain → DNS → Subdomains → Resolve IPs → Web Scan + Port Scan → Vulns → Report
