import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { Settings2, Lock, Play, Loader2 } from 'lucide-react';

const SCAN_TYPE_MAP = {
  IP_RECON: 'ip-recon',
  'SSL/TLS': 'ssl-check',
  IP_PORT_SCAN: 'port-scan',
  SUBDOMAIN_ENUM: 'subdomain-enum',
};

export default function ScanControls({ onCommandChange, onSubmit, isScanning }) {
  const { user } = useUser();
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('IP_RECON');
  const [ports, setPorts] = useState('');
  const [protocol, setProtocol] = useState('TCP');

  const showAdvanced = scanType === 'IP_PORT_SCAN' || (user && scanType === 'IP_PORT_SCAN');
  const needsAuth = (scanType === 'IP_PORT_SCAN' || scanType === 'SUBDOMAIN_ENUM') && !user;

  // Build CLI command string reactively
  useEffect(() => {
    let cmd = 'security-scan';
    if (target.trim()) cmd += ` --target ${target.trim()}`;
    if (scanType) cmd += ` --type ${SCAN_TYPE_MAP[scanType] || scanType}`;
    if (scanType === 'IP_PORT_SCAN' && ports.trim()) cmd += ` --ports ${ports.trim()}`;
    if (scanType === 'IP_PORT_SCAN' && protocol) cmd += ` --protocol ${protocol.toLowerCase()}`;
    onCommandChange(cmd);
  }, [target, scanType, ports, protocol, onCommandChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target.trim() || isScanning) return;
    if (needsAuth) return;
    onSubmit({ target: target.trim(), type: scanType, ports: ports.trim(), protocol });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      {/* Target Input */}
      <div className="form-group">
        <label className="form-label" htmlFor="scan-target">Target</label>
        <input
          id="scan-target"
          className="form-input mono"
          type="text"
          placeholder="e.g. 1.1.1.1 or example.com"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          spellCheck="false"
          autoFocus
        />
      </div>

      {/* Scan Type */}
      <div className="form-group">
        <label className="form-label" htmlFor="scan-type">Scan Type</label>
        <select
          id="scan-type"
          className="form-select"
          value={scanType}
          onChange={(e) => setScanType(e.target.value)}
        >
          <option value="IP_RECON">IP Reconnaissance</option>
          <option value="SSL/TLS">SSL / TLS Analysis</option>
          <option value="IP_PORT_SCAN">Port Scanning</option>
          <option value="SUBDOMAIN_ENUM">Subdomain Enumeration</option>
        </select>
      </div>

      {/* Advanced Options */}
      {scanType === 'IP_PORT_SCAN' && (
        <div className="auth-gate">
          <div className="advanced-options">
            <div className="advanced-options-header">
              <Settings2 size={14} />
              <span>Advanced Options</span>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="port-range">Port Range</label>
                <input
                  id="port-range"
                  className="form-input mono"
                  type="text"
                  placeholder="80,443 or 1-1000"
                  value={ports}
                  onChange={(e) => setPorts(e.target.value)}
                  disabled={needsAuth}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="protocol">Protocol</label>
                <select
                  id="protocol"
                  className="form-select"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  disabled={needsAuth}
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auth Gate Overlay */}
          {needsAuth && (
            <div className="auth-gate-overlay">
              <Lock size={20} />
              <span className="auth-gate-text">Sign in to unlock advanced scanning</span>
              <Link to="/auth" className="auth-gate-link">Sign In →</Link>
            </div>
          )}
        </div>
      )}

      {/* Subdomain Enum Auth Gate */}
      {scanType === 'SUBDOMAIN_ENUM' && needsAuth && (
        <div className="auth-gate" style={{ height: '80px', marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
          <div className="auth-gate-overlay" style={{ borderRadius: 'var(--radius)' }}>
            <Lock size={20} />
            <span className="auth-gate-text">Sign in to unlock Subdomain Enumeration</span>
            <Link to="/auth" className="auth-gate-link">Sign In →</Link>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`scan-button ${isScanning ? 'scanning' : ''}`}
        disabled={!target.trim() || isScanning || needsAuth}
      >
        {isScanning ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Play size={16} />
            Run Scan
          </>
        )}
      </button>
    </form>
  );
}
