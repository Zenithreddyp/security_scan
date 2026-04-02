import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { History, Lock, LogIn, Search, Globe, ShieldCheck, Radio } from 'lucide-react';

const TYPE_CONFIG = {
  IP_RECON: { cls: 'ip-recon', label: 'IP Recon', Icon: Globe },
  'SSL/TLS': { cls: 'ssl-tls', label: 'SSL/TLS', Icon: ShieldCheck },
  IP_PORT_SCAN: { cls: 'port-scan', label: 'Port Scan', Icon: Radio },
};

export default function PreviousScans() {
  const { user, token } = useUser();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) { setLoading(false); return; }

    async function fetchScans() {
      try {
        const res = await fetch('http://localhost:5000/api/scan/scans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setScans(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to fetch scans:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchScans();
  }, [user, token]);

  // Auth-gated
  if (!user) {
    return (
      <div className="container">
        <div className="auth-required-card">
          <Lock size={32} />
          <h2>Authentication Required</h2>
          <p>Sign in to view your scan history and access advanced features.</p>
          <Link to="/auth" className="btn-primary">
            <LogIn size={15} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="scans-page">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={22} />
              Previous Scans
            </h1>
            <p className="dashboard-subtitle">Your complete scan history</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '2px solid var(--border-color)', borderTop: '2px solid var(--accent)', borderRadius: '50%' }} />
          </div>
        ) : scans.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <h3>No scans yet</h3>
            <p>Run your first scan from the home page to see results here.</p>
            <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>Go to Scanner</Link>
          </div>
        ) : (
          <div className="scans-table-wrapper">
            <table className="scans-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, i) => {
                  const cfg = TYPE_CONFIG[scan.type] || TYPE_CONFIG.IP_RECON;
                  return (
                    <tr key={scan._id || i}>
                      <td className="target-cell">{scan.target || '—'}</td>
                      <td>
                        <span className={`scan-type-badge ${cfg.cls}`}>
                          <cfg.Icon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td>{scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className="card-status-badge safe">Complete</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
