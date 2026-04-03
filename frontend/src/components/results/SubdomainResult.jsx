import React from 'react';
import { Layers } from 'lucide-react';

export default function SubdomainResult({ data }) {
  const { subdomains = [], total_subdomains = 0 } = data || {};

  return (
    <div className="result-card">
      <div className="card-header">
        <div className="card-title">
          <Layers size={16} className="text-info" />
          <span>Subdomain Enumeration</span>
        </div>
        <span className="card-status-badge safe">Found: {total_subdomains}</span>
      </div>
      <div className="card-content">
        {subdomains.length === 0 ? (
          <div className="data-row">
            <span className="data-value">No subdomains discovered.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {subdomains.slice(0, 50).map((sub, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.5rem', 
                background: 'var(--bg-card-hover)', 
                borderRadius: 'var(--radius)' 
              }}>
                <span className="mono" style={{ fontSize: '0.875rem' }}>{sub.domain}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: sub.active ? 'var(--safe-color)' : 'var(--text-muted)' 
                }}>
                  {sub.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
            {total_subdomains > 50 && (
              <div className="data-row" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <span className="data-muted">+ {total_subdomains - 50} more subdomains omitted</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
