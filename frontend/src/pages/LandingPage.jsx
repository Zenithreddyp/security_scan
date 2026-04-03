import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ScanControls from '../components/ScanControls';
import Terminal from '../components/Terminal';
import IpReconResult from '../components/results/IpReconResult';
import SslTlsResult from '../components/results/SslTlsResult';
import PortScanResult from '../components/results/PortScanResult';
import SubdomainResult from '../components/results/SubdomainResult';
import { Zap } from 'lucide-react';

const SCAN_LOGS_POOL = [
  { text: 'Resolving target hostname...', type: 'info', prefix: '[*]' },
  { text: 'Establishing secure connection...', type: '', prefix: '[*]' },
  { text: 'Sending probe packets...', type: '', prefix: '[*]' },
  { text: 'Analyzing response headers...', type: '', prefix: '[*]' },
  { text: 'Querying threat intelligence databases...', type: 'info', prefix: '[*]' },
  { text: 'Cross-referencing ASN data...', type: '', prefix: '[*]' },
  { text: 'Checking certificate chain...', type: '', prefix: '[*]' },
  { text: 'Enumerating open services...', type: '', prefix: '[*]' },
  { text: 'Validating SSL/TLS handshake...', type: '', prefix: '[*]' },
  { text: 'Running passive fingerprinting...', type: 'info', prefix: '[*]' },
];

export default function LandingPage() {
  const { token } = useUser();
  const navigate = useNavigate();
  const [command, setCommand] = useState('security-scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [scanType, setScanTypeState] = useState(null);
  const resultsRef = useRef(null);

  const onCommandChange = useCallback((cmd) => {
    setCommand(cmd);
  }, []);

  const onSubmit = async (config) => {
    setIsScanning(true);
    setScanComplete(false);
    setResults(null);
    setScanProgress(0);
    setScanLogs([{ text: `Target: ${config.target}`, type: 'info', prefix: '[>]' }]);
    setScanTypeState(config.type);

    // Simulate progress + logs
    let progress = 0;
    let logIndex = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress > 92) progress = 92;
      setScanProgress(Math.floor(progress));

      if (logIndex < SCAN_LOGS_POOL.length && Math.random() > 0.4) {
        setScanLogs(prev => [...prev, SCAN_LOGS_POOL[logIndex]]);
        logIndex++;
      }
    }, 400);

    try {
      const payload = { target: config.target, scan_type: config.type };
      if (config.ports) payload.port_range = config.ports;
      if (config.protocol) payload.protocol = config.protocol;

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      console.log(headers);

      const res = await fetch('http://localhost:5000/api/scan/addscan', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);

      if (!res.ok) throw new Error('Scan API returned an error');

      const data = await res.json();
      setScanProgress(100);
      setScanLogs(prev => [...prev, { text: 'Data received from backend', type: 'success', prefix: '[✓]' }]);
      
      // Navigate dynamic to waiting dashboard
      navigate(`/dashboard?scanId=${data.scan.id}`);
      
    } catch (err) {
      clearInterval(progressInterval);
      setScanLogs(prev => [
        ...prev,
        { text: 'Backend connection failed — loading mock data...', type: 'warning', prefix: '[!]' },
      ]);
      setScanProgress(100);

      // Mock data based on scan type
      if (config.type === 'IP_RECON') {
        setResults({
          ip: config.target,
          hostname: 'one.one.one.one',
          city: 'San Francisco',
          region: 'California',
          country: 'US',
          org: 'AS13335 Cloudflare, Inc.',
          asn: 'AS13335',
          timezone: 'America/Los_Angeles',
        });
      } else if (config.type === 'SSL/TLS') {
        setResults({
          issuer: 'DigiCert Inc',
          subject: config.target,
          validFrom: '2024-01-15',
          validTo: '2025-01-15',
          serialNumber: '0A:1B:2C:3D:4E:5F',
          protocol: 'TLSv1.3',
          cipher: 'TLS_AES_256_GCM_SHA384',
          keySize: '256-bit',
        });
      } else if (config.type === 'SUBDOMAIN_ENUM') {
        setResults({
          total_subdomains: 5,
          subdomains: [
            { domain: `api.${config.target}`, active: true },
            { domain: `dev.${config.target}`, active: false },
            { domain: `staging.${config.target}`, active: true },
            { domain: `admin.${config.target}`, active: false },
            { domain: `blog.${config.target}`, active: true },
          ]
        });
      } else {
        setResults({
          ports: [
            { port: 80, protocol: 'TCP', state: 'open', service: 'HTTP' },
            { port: 443, protocol: 'TCP', state: 'open', service: 'HTTPS' },
            { port: 22, protocol: 'TCP', state: 'filtered', service: 'SSH' },
            { port: 8080, protocol: 'TCP', state: 'closed', service: 'HTTP-Proxy' },
          ],
          summary: { total: 4, open: 2, filtered: 1, closed: 1 },
        });
      }
    } finally {
      setIsScanning(false);
      setScanComplete(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  const renderResult = () => {
    if (!results || !scanType) return null;
    switch (scanType) {
      case 'IP_RECON': return <IpReconResult data={results} />;
      case 'SSL/TLS': return <SslTlsResult data={results} />;
      case 'IP_PORT_SCAN': return <PortScanResult data={results} />;
      case 'SUBDOMAIN_ENUM': return <SubdomainResult data={results} />;
      default: return <IpReconResult data={results} />;
    }
  };

  return (
    <>
      {/* Split View */}
      <div className="split-view">
        {/* Left — Controls */}
        <div className="split-left">
          <div className="hero-tag">
            <Zap size={12} />
            Security Intelligence Platform
          </div>
          <h1 className="hero-title">
            Scan. Analyze.<br />
            <span className="highlight">Secure.</span>
          </h1>
          <p className="hero-subtitle">
            Enter a target IP or domain, choose your scan type, and watch the terminal
            build your command in real-time.
          </p>

          <ScanControls
            onCommandChange={onCommandChange}
            onSubmit={onSubmit}
            isScanning={isScanning}
          />
        </div>

        {/* Right — Terminal */}
        <div className="split-right">
          <Terminal
            command={command}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scanLogs={scanLogs}
            scanComplete={scanComplete}
          />
        </div>
      </div>

      {/* Inline Results */}
      {(results || scanComplete) && (
        <div className="results-section" ref={resultsRef}>
          <div className="container">
            <div className="results-header">
              <div className="results-title">
                Scan Results
                {scanType && <span className="target-badge">{scanType}</span>}
              </div>
            </div>
            <div className="results-grid">
              {renderResult()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
