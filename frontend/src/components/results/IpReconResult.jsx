import React from 'react';
import { Globe, MapPin } from 'lucide-react';

export default function IpReconResult({ data }) {
  const fields = [
    { label: 'IP Address', key: 'ip' },
    { label: 'Hostname', key: 'hostname' },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'region' },
    { label: 'Country', key: 'country' },
    { label: 'Organization', key: 'org' },
    { label: 'ASN', key: 'asn' },
    { label: 'Timezone', key: 'timezone' },
  ];

  return (
    <div className="result-card card-ip">
      <div className="card-header">
        <div className="card-title">
          <Globe size={16} className="text-info" />
          <span>IP Reconnaissance</span>
        </div>
        <span className="card-status-badge safe">Resolved</span>
      </div>
      <div className="card-content">
        {fields.map(({ label, key }) => {
          const value = data?.[key] || data?.[label] || data?.[key.charAt(0).toUpperCase() + key.slice(1)];
          if (!value) return null;
          return (
            <div className="data-row" key={key}>
              <span className="data-label">{label}</span>
              <span className="data-value">{value}</span>
            </div>
          );
        })}
        {/* Fallback: render all unknown keys */}
        {Object.entries(data || {}).map(([key, value]) => {
          const known = fields.some(f => f.key === key || f.label === key || f.key === key.toLowerCase());
          if (known || typeof value === 'object') return null;
          return (
            <div className="data-row" key={key}>
              <span className="data-label">{key}</span>
              <span className="data-value">{String(value)}</span>
            </div>
          );
        })}
      </div>
      <div className="map-placeholder">
        <MapPin size={18} />
        <span>Map integration ready — connect Leaflet or Mapbox</span>
      </div>
    </div>
  );
}
