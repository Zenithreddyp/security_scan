import React from 'react';
import { Globe, MapPin, Network, Building2 } from 'lucide-react';

export default function IpReconResult({ data }) {
  // Unwrap findings array → raw_data if needed
  const raw = Array.isArray(data)
    ? (data[0]?.raw_data || data[0] || {})
    : (data?.raw_data || data || {});

  // Engine returns nested structure: network{asn,org}, registration{range,cidr,country,address,abuse_email}, location{city,region,country,lat,lon}
  const network      = raw.network      || {};
  const registration = raw.registration || {};
  const location     = raw.location     || {};

  const infoFields = [
    { label: 'IP Address',     value: raw.ip },
    { label: 'Hostname',       value: raw.hostname !== 'N/A' ? raw.hostname : null },
    { label: 'City',           value: location.city },
    { label: 'Region',         value: location.region },
    { label: 'Country',        value: location.country || registration.country },
    { label: 'Coordinates',    value: location.lat && location.lon ? `${location.lat}, ${location.lon}` : null },
    { label: 'ASN',            value: network.asn !== 'N/A' ? network.asn : null },
    { label: 'ASN Type',       value: network.asn_type !== 'N/A' ? network.asn_type : null },
    { label: 'Organization',   value: network.org !== 'N/A' ? network.org : null },
    { label: 'IP Range',       value: registration.range !== 'N/A' ? registration.range : null },
    { label: 'CIDR',           value: registration.cidr !== 'N/A' ? registration.cidr : null },
    { label: 'Address',        value: registration.address !== 'N/A' ? registration.address : null },
    { label: 'Abuse Contact',  value: registration.abuse_email !== 'N/A' ? registration.abuse_email : null },
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
        {infoFields.map(({ label, value }) => {
          if (!value) return null;
          return (
            <div className="data-row" key={label}>
              <span className="data-label">{label}</span>
              <span className="data-value">{value}</span>
            </div>
          );
        })}

        {/* Fallback: show any top-level string/number fields not covered above */}
        {Object.entries(raw).map(([key, value]) => {
          const covered = ['ip', 'hostname', 'network', 'registration', 'location', 'error'];
          if (covered.includes(key) || typeof value === 'object' || value == null) return null;
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
        <span>
          {location.lat && location.lon
            ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
            : 'Map integration ready — connect Leaflet or Mapbox'}
        </span>
      </div>
    </div>
  );
}
