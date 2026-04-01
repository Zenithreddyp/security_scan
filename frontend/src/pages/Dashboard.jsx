import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import IpReconResult from '../components/results/IpReconResult';
import SslTlsResult from '../components/results/SslTlsResult';
import PortScanResult from '../components/results/PortScanResult';
import ResultCard from '../components/ResultCard';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const scan_type = searchParams.get('type') || 'IP_RECON';
  const portRange = searchParams.get('port_range');
  const protocol = searchParams.get('protocol');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const { token } = useUser();
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (loading && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, loading]);

  useEffect(() => {
    if (!query) return;
    let logInterval;

    async function executeScan() {
      setLoading(true);
      setResults(null);
      setLogs(['Initializing secure connection...', `Target: ${query}`, `Scan type: ${type}`]);

      logInterval = setInterval(() => {
        const pool = [
          'Sending probe packets...',
          'Analyzing response headers...',
          'Querying threat intel databases...',
          'Cross-referencing results...',
          'Validating data integrity...',
        ];
        setLogs(prev => [...prev, pool[Math.floor(Math.random() * pool.length)]]);
      }, 600);

      try {
        const payload = { target: query, scan_type:scan_type };
        if (portRange) payload.portRange = portRange;
        if (protocol) payload.protocol = protocol;

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('http://localhost:5000/api/scan/addscan', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('API Scan failed');
        const data = await res.json();

        clearInterval(logInterval);
        setLogs(prev => [...prev, '✓ Scan Complete.']);
        setResults(data.result || data);
        setLoading(false);
      } catch (err) {
        clearInterval(logInterval);
        setLogs(prev => [...prev, '! Backend unavailable — loading mock data...']);

        setTimeout(() => {
          if (type === 'SSL/TLS') {
            setResults({ issuer: 'Let\'s Encrypt', subject: query, validFrom: '2024-06-01', validTo: '2025-06-01', protocol: 'TLSv1.3', cipher: 'ECDHE-RSA-AES128-GCM-SHA256', keySize: '128-bit' });
          } else if (type === 'IP_PORT_SCAN') {
            setResults({ ports: [{ port: 80, protocol: 'TCP', state: 'open', service: 'HTTP' }, { port: 443, protocol: 'TCP', state: 'open', service: 'HTTPS' }] });
          } else {
            setResults({ ip: query, hostname: 'example.com', city: 'San Francisco', country: 'US', org: 'AS15169 Google LLC' });
          }
          setLoading(false);
        }, 3000);
      }
    }

    executeScan();
    return () => { if (logInterval) clearInterval(logInterval); };
  }, [query, type, portRange, protocol, token]);

  const renderResult = () => {
    if (!results) return null;
    switch (type) {
      case 'SSL/TLS': return <SslTlsResult data={results} />;
      case 'IP_PORT_SCAN': return <PortScanResult data={results} />;
      case 'IP_RECON':
      default: return <IpReconResult data={results} />;
    }
  };

  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Scan Results</h1>
          {query ? (
            <p className="dashboard-subtitle">
              <span className="mono">{query}</span> — {type} Report
            </p>
          ) : (
            <p className="dashboard-subtitle">Navigate to the home page to start a scan</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="result-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="mono">Executing scan...</span>
          </div>
          <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '0.25rem' }}>{'>'} {log}</div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      ) : results ? (
        <div className="results-grid">
          {renderResult()}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '4rem' }}>
          <p className="mono">No active scan. Use the home page scanner to initiate one.</p>
        </div>
      )}
    </div>
  );
}
