import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ResultCard({ title, data, status }) {
  // Determine status color and icon
  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <CheckCircle size={18} className="text-success" color="var(--success)" />;
      case 'warning':
        return <AlertCircle size={18} className="text-warning" color="var(--warning)" />;
      case 'danger':
        return <ShieldAlert size={18} className="text-error" color="var(--error)" />;
      default:
        return <div className={`card-status status-${status}`}></div>;
    }
  };

  return (
    <div className="result-card">
      <div className="card-header">
        <div className="card-title">
          {getStatusIcon()}
          <span>{title}</span>
        </div>
      </div>
      <div className="card-content">
        {Object.entries(data).map(([key, value]) => (
          <div className="data-row" key={key}>
            <span className="data-label">{key}:</span>
            <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
