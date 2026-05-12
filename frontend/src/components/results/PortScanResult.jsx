import React from 'react';
import { Radio } from 'lucide-react';

export default function PortScanResult({ data }) {
  // If no data is passed at all, or if it's an empty array, render nothing safely
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  // THE FIX: If `data` is an array (which `data.findings` is), grab the first item. 
  // If it's already an object, just use it as-is.
  const scanItem = Array.isArray(data) ? data[0] : data;

  // 1. Extract exactly what your JSON provides from the finding object
  const title = scanItem.title || 'Port Scan Results';
  const rawData = scanItem.raw_data || {};
  
  // Look specifically for raw_data.open_ports
  const ports = Array.isArray(rawData.open_ports) ? rawData.open_ports : [];
  const totalOpen = rawData.total_open || ports.length;
  
  // Protocol is at the raw_data level in your JSON
  const protocol = rawData.protocol ? String(rawData.protocol).toUpperCase() : 'TCP';

  return (
    <div className="result-card card-port">
      <div className="card-header">
        <div className="card-title">
          <Radio size={16} className="text-warning" />
          <span>{title}</span>
        </div>
        <span className="card-status-badge warning">
          {totalOpen} ports found
        </span>
      </div>

      {/* Summary Section based on your JSON's root properties */}
      <div className="card-content" style={{ marginBottom: '1rem' }}>
        <div className="data-row">
          <span className="data-label">Scan ID</span>
          <span className="data-value">{scanItem.scan_id || '—'}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Port Range</span>
          <span className="data-value">{rawData.port_range || '—'}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Date</span>
          <span className="data-value">
            {scanItem.created_at ? new Date(scanItem.created_at).toLocaleString() : '—'}
          </span>
        </div>
      </div>

      {/* Ports Table Section */}
      {ports.length > 0 ? (
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
            {ports.map((p, i) => {
              // Safety check for malformed array items
              if (!p || typeof p !== 'object') return null;

              return (
                <tr key={i}>
                  <td>{p.port || '—'}</td>
                  <td>{protocol}</td>
                  <td>
                    <span className="port-status">
                      <span className="port-status-dot open" />
                      Open
                    </span>
                  </td>
                  <td>{p.service ? String(p.service).toUpperCase() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="card-content">
          <div className="data-row">
            <span className="data-label">Status</span>
            <span className="data-value">No open ports found.</span>
          </div>
        </div>
      )}
    </div>
  );
}