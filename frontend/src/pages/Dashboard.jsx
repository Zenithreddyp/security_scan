import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import IpReconResult from '../components/results/IpReconResult';
import SslTlsResult from '../components/results/SslTlsResult';
import PortScanResult from '../components/results/PortScanResult';
import ResultCard from '../components/ResultCard';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId'); // Listen for an ID instead of just query

  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scanType, setScanType] = useState('IP_RECON');
  const [target, setTarget] = useState('');
  
  const [logs, setLogs] = useState([]);
  const { token } = useUser();
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (loading && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, loading]);

  useEffect(() => {
      if (!scanId) return;
      
      async function fetchScanDetails() {
         setLoading(true);
         setLogs(['Waiting for scan to complete...', `Monitoring scan ID: ${scanId}`]);

         try {
             const headers = {};
             if (token) headers['Authorization'] = `Bearer ${token}`;

             const res = await fetch(`http://localhost:5000/api/scan/details/${scanId}`, { headers });
             if (!res.ok) throw new Error('API failed to fetch scan details');
             
             const data = await res.json();
             
             setScanType(data.scan.scan_type);
             
             if (data.scan.status === 'completed') {
                 setResults(data.findings); 
                 setLogs(prev => [...prev, '✓ Scan Complete (Fetched from Database).']);
                 setLoading(false);
             } else if (data.scan.status === 'failed') {
                 setLogs(prev => [...prev, 'X Scan Failed.']);
                 setLoading(false);
             } else {
                 setLogs(prev => [...prev, 'Scan is currently running...']);
                 setLoading(true);
             }
         } catch (e) {
             setLogs(prev => [...prev, '! Failed to fetch scan data.']);
         }
      }

      fetchScanDetails();
  }, [scanId, token]);

  useEffect(() => {
      if (!socket || !scanId) return;

      const handleScanCompleted = (data) => {
          if (data.scan_id === scanId) {
              setLogs(prev => [...prev, '✓ Scan Complete (Real-time update received).']);
              setResults(data.results);
              
              setLoading(false);
          }
      };

      socket.on("scan_completed", handleScanCompleted);
      
      // Keep emitting fun logs while loading
      let logInterval;
      if (loading) {
          logInterval = setInterval(() => {
            const pool = [
              'Analyzing response sequences...',
              'Querying threat intel databases...',
              'Processing asynchronous tasks...',
              'Awaiting background worker payload...',
            ];
            setLogs(prev => [...prev, pool[Math.floor(Math.random() * pool.length)]]);
          }, 1500);
      }

      return () => {
          socket.off("scan_completed", handleScanCompleted);
          if (logInterval) clearInterval(logInterval);
      };
  }, [socket, scanId, loading]);

  const renderResult = () => {
    if (!results) return null;
    switch (scanType) {
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
          {scanId ? (
            <p className="dashboard-subtitle">
              <span className="mono">{target || scanId}</span> — {scanType} Report
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
