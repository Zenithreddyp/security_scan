import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function SslTlsResult({ data }) {
  // `data` is passed as either:
  //   - a flat raw_data object (from socket)  
  //   - an array of finding rows (from REST fetch) — take first item's raw_data
  const raw = Array.isArray(data)
    ? (data[0]?.raw_data || data[0] || {})
    : (data?.raw_data || data || {});

  const getStatus = () => {
    const now = new Date();
    const expiry = raw.valid_until || raw.validTo;
    if (expiry && new Date(expiry) < now) return { cls: 'expired', label: 'Expired', Icon: ShieldX };
    if (raw.expired) return { cls: 'expired', label: 'Expired', Icon: ShieldX };
    if (raw.weak_cipher || raw.weakCipher) return { cls: 'weak', label: 'Weak Cipher', Icon: ShieldAlert };
    return { cls: 'valid', label: 'Valid', Icon: ShieldCheck };
  };

  const { cls, label, Icon } = getStatus();

  // Helper: format subject/issuer dict → readable string
  const formatName = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.commonName || val.organizationName || Object.values(val).filter(Boolean).join(', ') || null;
    }
    return null;
  };

  const formatDate = (val) => {
    if (!val) return null;
    try { return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return val; }
  };

  // Map engine output keys → display labels
  const certFields = [
    { label: 'Hostname',          value: raw.hostname },
    { label: 'Subject',           value: formatName(raw.subject || raw.Subject) },
    { label: 'Issuer',            value: formatName(raw.issuer || raw.Issuer) },
    { label: 'Valid From',        value: formatDate(raw.valid_from  || raw.validFrom) },
    { label: 'Valid Until',       value: formatDate(raw.valid_until || raw.validTo) },
    { label: 'Days Remaining',    value: raw.days_left != null ? `${raw.days_left} days` : null },
    { label: 'Serial Number',     value: raw.serial_number || raw.serialNumber },
    { label: 'Signature Algo',    value: raw.signature_algorithm || raw.signatureAlgorithm },
    { label: 'Protocol',          value: raw.protocol },
    { label: 'Cipher Suite',      value: raw.cipher },
    { label: 'Key Size',          value: raw.keySize || raw.key_size },
  ];

  return (
    <div className="result-card card-ssl">
      <div className="card-header">
        <div className="card-title">
          <Icon size={16} className={`text-${cls === 'valid' ? 'success' : cls === 'weak' ? 'warning' : 'error'}`} />
          <span>SSL / TLS Analysis</span>
        </div>
        <span className={`card-status-badge ${cls === 'valid' ? 'safe' : cls === 'weak' ? 'warning' : 'danger'}`}>
          {label}
        </span>
      </div>

      <div className={`ssl-status ${cls}`}>
        <Icon size={16} />
        {cls === 'valid' ? 'Certificate is valid and trusted' : cls === 'weak' ? 'Weak cipher suite detected' : 'Certificate has expired'}
      </div>

      <div className="card-content">
        {certFields.map(({ label, value }) => {
          if (!value) return null;
          return (
            <div className="data-row" key={label}>
              <span className="data-label">{label}</span>
              <span className="data-value">{value}</span>
            </div>
          );
        })}

        {/* SAN (Subject Alternative Names) */}
        {Array.isArray(raw.san) && raw.san.length > 0 && (
          <div className="data-row" key="san">
            <span className="data-label">Alt Names</span>
            <span className="data-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
              {raw.san.slice(0, 8).join(', ')}{raw.san.length > 8 ? ` +${raw.san.length - 8} more` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
