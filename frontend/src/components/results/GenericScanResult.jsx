import React from 'react';
import { AlertTriangle, CheckCircle, Info, Search } from 'lucide-react';
import { SCAN_LABEL_MAP } from '../../config/scanTypes';

function unwrapFinding(data) {
  if (Array.isArray(data)) return data[0]?.raw_data || data[0] || {};
  return data?.raw_data || data || {};
}

function titleize(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPrimaryCollection(raw) {
  const collectionKeys = [
    'findings',
    'results',
    'interesting_paths',
    'open_ports',
    'endpoints',
    'records',
    'urls',
    'files',
    'probes',
    'technologies',
    'subdomains',
  ];

  for (const key of collectionKeys) {
    if (Array.isArray(raw[key])) return { key, items: raw[key] };
  }

  return { key: null, items: [] };
}

function summarizeValue(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === 'object') return `${Object.keys(value).length} fields`;
  return String(value);
}

function renderItemValue(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.slice(0, 4).map(renderItemValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const preferred = value.url || value.host || value.path || value.name || value.type || value.service || value.domain || value.raw;
    if (preferred) return String(preferred);
    return Object.entries(value)
      .slice(0, 3)
      .map(([key, val]) => `${titleize(key)}: ${renderItemValue(val)}`)
      .join(' | ');
  }
  return String(value);
}

export default function GenericScanResult({ data, scanType }) {
  const raw = unwrapFinding(data);
  const { key: collectionKey, items } = getPrimaryCollection(raw);
  const hasError = Boolean(raw.error);
  const label = SCAN_LABEL_MAP[scanType] || scanType || 'Scan Results';

  const summaryEntries = Object.entries(raw)
    .filter(([key, value]) => !['error', 'stderr', 'command'].includes(key) && !Array.isArray(value) && typeof value !== 'object')
    .map(([key, value]) => [key, summarizeValue(value)])
    .filter(([, value]) => value);

  return (
    <div className="result-card">
      <div className="card-header">
        <div className="card-title">
          {hasError ? <AlertTriangle size={16} className="text-warning" /> : <Search size={16} className="text-info" />}
          <span>{label}</span>
        </div>
        <span className={`card-status-badge ${hasError ? 'warning' : 'safe'}`}>
          {hasError ? 'Needs Tooling' : `${items.length} items`}
        </span>
      </div>

      {hasError && (
        <div className="ssl-status weak">
          <Info size={16} />
          {raw.install_hint || raw.error}
        </div>
      )}

      <div className="card-content">
        {summaryEntries.slice(0, 8).map(([key, value]) => (
          <div className="data-row" key={key}>
            <span className="data-label">{titleize(key)}</span>
            <span className="data-value">{value}</span>
          </div>
        ))}

        {!hasError && items.length === 0 && (
          <div className="data-row">
            <span className="data-value">
              <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '0.375rem' }} />
              No notable results returned.
            </span>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="card-content" style={{ marginTop: '1rem' }}>
          <div className="data-row">
            <span className="data-label">{titleize(collectionKey)}</span>
            <span className="data-value">{items.length} shown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.slice(0, 50).map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '0.625rem',
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                <span className="mono">{renderItemValue(item) || JSON.stringify(item)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
