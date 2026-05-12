import React from 'react';
import { CheckCircle, Terminal as TerminalIcon, Zap, BookOpen, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocsPage() {
  return (
    <div className="container">
      <div className="docs-page">
        <h1>Documentation</h1>
        <p className="docs-subtitle">
          Everything you need to get started with the Security Scan Platform.
        </p>

        {/* Getting Started */}
        <section className="docs-section">
          <h2>Getting Started</h2>
          <p>
            Security Scan Platform provides a unified interface for performing IP reconnaissance,
            SSL/TLS certificate analysis, and port scanning against any target. Simply enter your
            target in the scan bar and select your desired scan type.
          </p>
          <ul className="docs-list">
            <li>
              <CheckCircle size={16} />
              <span>Enter an IP address or domain name in the <code>Target</code> field</span>
            </li>
            <li>
              <CheckCircle size={16} />
              <span>Select your scan type from the dropdown: <code>IP_RECON</code>, <code>SSL/TLS</code>, or <code>IP_PORT_SCAN</code></span>
            </li>
            <li>
              <CheckCircle size={16} />
              <span>Click <code>Run Scan</code> and watch the terminal render your command in real-time</span>
            </li>
          </ul>
        </section>

        {/* Scan Types */}
        <section className="docs-section">
          <h2>Scan Types</h2>

          <h3><Zap size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />IP Reconnaissance</h3>
          <p>
            Gathers geolocation data, ASN information, hostname resolution, and organization details
            for a given IP address. This scan is available to all users without authentication.
          </p>
          <code className="docs-code">
            <span className="keyword">$</span> security-scan <span className="keyword">--target</span> <span className="string">1.1.1.1</span> <span className="keyword">--type</span> <span className="string">ip-recon</span>
          </code>

          <h3><Lock size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />SSL / TLS Analysis</h3>
          <p>
            Retrieves and validates SSL/TLS certificates, checks expiration dates, cipher suite strength,
            and protocol versions for any domain.
          </p>
          <code className="docs-code">
            <span className="keyword">$</span> security-scan <span className="keyword">--target</span> <span className="string">example.com</span> <span className="keyword">--type</span> <span className="string">ssl-check</span>
          </code>

          <h3><TerminalIcon size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />Port Scanning</h3>
          <p>
            Performs TCP/UDP port scanning with configurable port ranges. This is an advanced feature
            that requires authentication. Supports custom port ranges and protocol selection.
          </p>
          <code className="docs-code">
            <span className="keyword">$</span> security-scan <span className="keyword">--target</span> <span className="string">192.168.1.1</span> <span className="keyword">--type</span> <span className="string">port-scan</span> <span className="keyword">--ports</span> <span className="string">80,443,8080</span> <span className="keyword">--protocol</span> <span className="string">tcp</span>
          </code>
        </section>

        {/* API Reference */}
        <section className="docs-section">
          <h2>API Reference</h2>
          <p>
            The platform communicates with a REST backend. Below are the primary endpoints:
          </p>
          <div className="result-card" style={{ marginBottom: '1rem' }}>
            <div className="card-content">
              <div className="data-row">
                <span className="data-label" style={{ color: 'var(--success)' }}>POST</span>
                <span className="data-value">/api/scan/addscan</span>
              </div>
              <div className="data-row">
                <span className="data-label" style={{ color: 'var(--info)' }}>GET</span>
                <span className="data-value">/api/scan/scans</span>
              </div>
              <div className="data-row">
                <span className="data-label" style={{ color: 'var(--success)' }}>POST</span>
                <span className="data-value">/api/auth/login</span>
              </div>
              <div className="data-row">
                <span className="data-label" style={{ color: 'var(--success)' }}>POST</span>
                <span className="data-value">/api/auth/register</span>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Usage */}
        <section className="docs-section">
          <h2>Advanced Usage</h2>
          <p>
            Authenticated users unlock advanced scanning capabilities including port scanning
            with custom ranges, protocol selection, and access to scan history.
          </p>
          <ul className="docs-list">
            <li>
              <ArrowRight size={16} />
              <span>Sign in to access <code>Port Scanning</code> with customizable port ranges</span>
            </li>
            <li>
              <ArrowRight size={16} />
              <span>View your complete scan history in the <code>Previous Scans</code> page</span>
            </li>
            <li>
              <ArrowRight size={16} />
              <span>Upload files for MD5/SHA256 hash computation in <code>File Security</code></span>
            </li>
          </ul>
        </section>

        {/* Future Modules */}
        <section className="docs-section">
          <h2>Upcoming Modules</h2>
          <p>
            The platform architecture supports additional scanning modules that are in development:
          </p>
          <ul className="docs-list">
            <li>
              <BookOpen size={16} />
              <span><strong>Web Tech Stack Detection</strong> — Identify frameworks, libraries, and CMS platforms</span>
            </li>
            <li>
              <BookOpen size={16} />
              <span><strong>CVE Mapping</strong> — Cross-reference discovered services with known vulnerabilities</span>
            </li>
            <li>
              <BookOpen size={16} />
              <span><strong>OSINT / MISP Integration</strong> — File hash lookups against threat intelligence feeds</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
