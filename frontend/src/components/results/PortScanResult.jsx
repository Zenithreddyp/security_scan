import React from 'react';
import { Radio } from 'lucide-react';

export default function PortScanResult({ data }) {
  // data.ports should be an array of { port, protocol, state, service }
  const ports = data?.ports || data?.openPorts || [];
  const summary = data?.summary || null;

  return (
    <div className="result-card card-port">
      <div className="card-header">
        <div className="card-title">
          <Radio size={16} className="text-warning" />
          <span>Port Scan Results</span>
        </div>
        <span className="card-status-badge warning">
          {Array.isArray(ports) ? ports.length : 0} ports found
        </span>
      </div>

      {summary && (
        <div className="card-content" style={{ marginBottom: '1rem' }}>
          {typeof summary === 'string' ? (
            <div className="data-row">
              <span className="data-label">Summary</span>
              <span className="data-value">{summary}</span>
            </div>
          ) : (
            Object.entries(summary).map(([k, v]) => (
              <div className="data-row" key={k}>
                <span className="data-label">{k}</span>
                <span className="data-value">{String(v)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {Array.isArray(ports) && ports.length > 0 ? (
        <table className="port-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Protocol</th>
              <th>State</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {ports.map((p, i) => (
              <tr key={i}>
                <td>{p.port || p.Port || '—'}</td>
                <td>{p.protocol || p.Protocol || 'TCP'}</td>
                <td>
                  <span className="port-status">
                    <span className={`port-status-dot ${(p.state || p.State || 'open').toLowerCase()}`} />
                    {p.state || p.State || 'open'}
                  </span>
                </td>
                <td>{p.service || p.Service || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="card-content">
          {/* Fallback: render data as key-value pairs */}
          {Object.entries(data || {}).map(([key, value]) => {
            if (key === 'ports' || key === 'openPorts' || key === 'summary') return null;
            return (
              <div className="data-row" key={key}>
                <span className="data-label">{key}</span>
                <span className="data-value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
