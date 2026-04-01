import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function SslTlsResult({ data }) {
  const getStatus = () => {
    if (data?.expired) return { cls: 'expired', label: 'Expired', Icon: ShieldX };
    if (data?.weak_cipher || data?.weakCipher) return { cls: 'weak', label: 'Weak Cipher', Icon: ShieldAlert };
    return { cls: 'valid', label: 'Valid', Icon: ShieldCheck };
  };

  const { cls, label, Icon } = getStatus();

  const certFields = [
    { label: 'Issuer', key: 'issuer' },
    { label: 'Subject', key: 'subject' },
    { label: 'Valid From', key: 'validFrom' },
    { label: 'Valid To', key: 'validTo' },
    { label: 'Serial Number', key: 'serialNumber' },
    { label: 'Protocol', key: 'protocol' },
    { label: 'Cipher Suite', key: 'cipher' },
    { label: 'Key Size', key: 'keySize' },
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
        {certFields.map(({ label, key }) => {
          const val = data?.[key] || data?.[label] || data?.[key.charAt(0).toUpperCase() + key.slice(1)];
          if (!val) return null;
          return (
            <div className="data-row" key={key}>
              <span className="data-label">{label}</span>
              <span className="data-value">{val}</span>
            </div>
          );
        })}
        {Object.entries(data || {}).map(([key, value]) => {
          const known = certFields.some(f => f.key === key || f.label === key);
          if (known || key === 'expired' || key === 'weak_cipher' || key === 'weakCipher' || typeof value === 'object') return null;
          return (
            <div className="data-row" key={key}>
              <span className="data-label">{key}</span>
              <span className="data-value">{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
