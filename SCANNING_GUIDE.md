# 🛡️ Security Scan Platform: Roadmap & TODO

REMAINING
## 🔍 Phase 1: Attack Surface Discovery (High Priority)

### 🌐 A. Domain Intelligence
- [ ] **Subdomain Enumeration**
  - Create `subdomain_module.py`
  - Discover subdomains via A/AAAA records

- [ ] **DNS Records Analysis**
  - Fetch and categorize:
    - MX (Mail servers)
    - TXT (SPF / DMARC)
    - NS (Nameservers)
  - Identify third-party dependencies

- [ ] **Subdomain Takeover Detection**
  - Detect dangling DNS records
  - Check for unclaimed services (S3, Azure, etc.)

---

### 🌍 B. Enhanced IP Recon
- [ ] **WHOIS & ASN Lookup**
  - Extend `recon_module.py`
  - Extract:
    - Owner details
    - ASN organization
  - Detect cloud providers (AWS, GCP, etc.)

- [ ] **Traceroute & Path Analysis**
  - Implement network path discovery
  - Identify:
    - Intermediate hops
    - Firewalls / filtering layers

---

## 🧠 Phase 2: Service & Tech Enumeration

### 🖥️ A. Web Tech Stack Detection
- [ ] **Technology Profiling**
  - Detect:
    - CMS (WordPress, Joomla)
    - Backend (Node.js, PHP)
    - Web servers (Nginx, Apache)

- [ ] **HTTP Security Headers Audit**
  - Check for:
    - `X-Frame-Options`
    - `Content-Security-Policy (CSP)`
    - `Strict-Transport-Security (HSTS)`
    - `X-Content-Type-Options`

---

### 🔌 B. Advanced Port & Service Scanning
- [ ] **Banner Grabbing**
  - Capture service banners
  - Identify versions of running services

- [ ] **OS Fingerprinting**
  - Use TCP/IP behavior
  - Detect OS:
    - Linux
    - Windows

---

## 🧨 Phase 3: Active Vulnerability Scanning

### 🕷️ A. Web Vulnerability Discovery
- [ ] **Nuclei Integration**
  - Run YAML-based templates
  - Detect:
    - Known CVEs
    - Misconfigurations

- [ ] **Directory & File Fuzzing**
  - Create `dir_fuzzer.py`
  - Discover:
    - `.env`, `.git`
    - `/admin`, hidden endpoints

---

### 🧬 B. Vulnerability Mapping
- [ ] **CVE Mapping**
  - Cross-reference detected versions
  - Use:
    - NVD (National Vulnerability Database)
  - Automate vulnerability correlation

---

## 🔑 Phase 4: Identity & Perimeter Recon

- [ ] **Email & Pattern Discovery**
  - Identify corporate email formats
  - Use OSINT techniques

- [ ] **Credential Breach Check**
  - Integrate APIs (e.g., HaveIBeenPwned)
  - Check leaked credentials

- [ ] **GitHub / Code Recon**
  - Scan public repositories
  - Detect:
    - Hardcoded API keys
    - Internal endpoints

---

## 📊 Phase 5: Orchestration & Reporting

### 🔄 Automation Pipelines
- [ ] **IP Flow Orchestrator**
