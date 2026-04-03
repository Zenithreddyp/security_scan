import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History, Lock, LogIn, Search, Globe, ShieldCheck, 
  Radio, ChevronDown, ChevronUp, AlertTriangle, 
  Info, AlertOctagon, Target
} from 'lucide-react';

const TYPE_CONFIG = {
  IP_RECON: { cls: 'ip-recon', label: 'IP Recon', Icon: Globe },
  'SSL/TLS': { cls: 'ssl-tls', label: 'SSL/TLS', Icon: ShieldCheck },
  IP_PORT_SCAN: { cls: 'port-scan', label: 'Port Scan', Icon: Radio },
  SUBDOMAIN_SCAN: { cls: 'subdomain-scan', label: 'Subdomains', Icon: Globe }
};

const SEVERITY_COLORS = {
  critical: 'var(--error)',
  high: '#ea580c',
  medium: 'var(--warning)',
  low: 'var(--info)',
  info: 'var(--text-tertiary)'
};

const SEVERITY_ICONS = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertTriangle,
  low: Info,
  info: Info
};

export default function PreviousScans() {
  const { user, token } = useUser();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [scans, setScans] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [loadingScans, setLoadingScans] = useState(true);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [expandedScanId, setExpandedScanId] = useState(null);

  useEffect(() => {
    if (!user || !token) { 
      setLoadingScans(false);
      setLoadingTargets(false);
      return; 
    }

    async function fetchData() {
      try {
        const [scansRes, targetsRes] = await Promise.all([
          fetch('http://localhost:5000/api/scan/scans', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/target/alltargets', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        if (scansRes.ok) {
          const data = await scansRes.json();
          setScans(Array.isArray(data.scans) ? data.scans : []);
        }
        
        if (targetsRes.ok) {
          const data = await targetsRes.json();
          setTargets(Array.isArray(data.targets) ? data.targets : []);
        }
      } catch (e) {
        console.error('Failed to fetch data:', e);
      } finally {
        setLoadingScans(false);
        setLoadingTargets(false);
      }
    }
    fetchData();
  }, [user, token]);

  useEffect(() => {
      if (!socket) return;

        socket.on("scan_completed", (data) => {
          setScans((prevScans) => prevScans.map(scan => 
              scan.id === data.scan_id
                ? { ...scan, status: data.status, findings: data.findings || scan.findings } 
                : scan
          ));
      });

      return () => socket.off("scan_completed");
  }, [socket]);

  const handleScanClick = (scanId, e) => {
      if (e) e.stopPropagation();
      navigate(`/dashboard?scanId=${scanId}`);
  };

  const toggleExpand = (scanId) => {
    setExpandedScanId(prev => prev === scanId ? null : scanId);
  };

  // Auth-gated
  if (!user) {
    return (
      <div className="container">
        <div className="auth-required-card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
          <Lock size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem', margin: '0 auto' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sign in to view your scan history and access advanced features.</p>
          <Link to="/auth" className="btn-primary">
            <LogIn size={18} />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const selectedTarget = targets.find(t => t.id === selectedTargetId);
  
  const filteredScans = selectedTargetId && selectedTarget
    ? scans.filter(s => {
        return (selectedTarget.target_url && s.target_url === selectedTarget.target_url) || 
               (selectedTarget.target_ip && s.target_ip === selectedTarget.target_ip);
      })
    : scans;

  return (
    <div className="container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <div className="scans-page" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* SIDEBAR: Targets */}
        <div className="targets-sidebar" style={{ 
          flex: '1 1 250px', 
          maxWidth: '300px', 
          background: 'var(--card-bg)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.25rem', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Target size={18} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Targets
            </h3>
          </div>
          
          {loadingTargets ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
              <div className="animate-spin" style={{ width: '1.5rem', height: '1.5rem', border: '2px solid var(--border-color)', borderTop: '2px solid var(--accent)', borderRadius: '50%' }} />
            </div>
          ) : targets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No targets found.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <li>
                <button 
                  onClick={() => setSelectedTargetId(null)}
                  style={{ 
                    width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', 
                    borderRadius: 'var(--radius)', 
                    background: selectedTargetId === null ? 'var(--accent-glow)' : 'transparent', 
                    color: selectedTargetId === null ? 'var(--text-primary)' : 'var(--text-secondary)', 
                    fontWeight: selectedTargetId === null ? 600 : 500, 
                    transition: 'all var(--transition-fast)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedTargetId === null ? 'var(--accent)' : 'transparent' }}></div>
                  All Targets
                </button>
              </li>
              {targets.map(t => (
                <li key={t.id}>
                  <button 
                    onClick={() => setSelectedTargetId(t.id)}
                    style={{ 
                      width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', 
                      borderRadius: 'var(--radius)', 
                      background: selectedTargetId === t.id ? 'var(--accent-glow)' : 'transparent', 
                      color: selectedTargetId === t.id ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      fontWeight: selectedTargetId === t.id ? 600 : 500, 
                      transition: 'all var(--transition-fast)',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedTargetId === t.id ? 'var(--accent)' : 'transparent' }}></div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.label?.length ? t.label.join(', ') : (t.target_url || t.target_ip)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* MAIN CONTENT: Scans */}
        <div className="scans-main" style={{ flex: '3 1 600px' }}>
          <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
            <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 700, margin: 0, marginBottom: '0.5rem' }}>
              <History size={28} style={{ color: 'var(--accent)' }}/>
              {selectedTargetId && selectedTarget 
                ? `Scans for ${selectedTarget.label?.length ? selectedTarget.label.join(', ') : (selectedTarget.target_url || selectedTarget.target_ip)}` 
                : 'All Previous Scans'
              }
            </h1>
            <p className="dashboard-subtitle" style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Review your historical scans, targets, and detailed findings.
            </p>
          </div>

          {loadingScans ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '2px solid var(--border-color)', borderTop: '2px solid var(--accent)', borderRadius: '50%' }} />
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <Search size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No scans found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {selectedTargetId ? "This target doesn't have any associated scans yet." : "Run your first scan from the home page to see results here."}
              </p>
              {!selectedTargetId && (
                <Link to="/" className="btn-primary">Go to Scanner</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredScans.map(scan => {
                const cfg = TYPE_CONFIG[scan.scan_type] || TYPE_CONFIG.IP_RECON;
                const isExpanded = expandedScanId === scan.id;
                const findings = scan.findings || [];
                
                // Calculate severity counts from nested raw_data
                const counts = { critical: 0, high: 0, medium: 0, low: 0 };
                findings.forEach(f => {
                  const sev = f.raw_data?.severity?.toLowerCase();
                  if (counts[sev] !== undefined) counts[sev]++;
                });

                return (
                  <div key={scan.id} style={{ 
                    background: 'var(--card-bg)', 
                    border: `1px solid ${isExpanded ? 'var(--border-color-subtle)' : 'var(--border-color)'}`, 
                    borderRadius: 'var(--radius-lg)', 
                    overflow: 'hidden', 
                    transition: 'all var(--transition-fast)',
                    boxShadow: isExpanded ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'
                  }}>
                    
                    {/* ACCORDION HEADER */}
                    <div 
                      onClick={() => toggleExpand(scan.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', padding: '1.25rem', cursor: 'pointer', 
                        background: isExpanded ? 'var(--bg-secondary)' : 'transparent', 
                        gap: '1rem',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                            {scan.target_url || scan.target_ip || 'Unknown Target'}
                          </span>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem', 
                            fontSize: '0.75rem', fontWeight: 500, padding: '0.125rem 0.5rem', 
                            borderRadius: '99px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <cfg.Icon size={12} />
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          <span>{scan.started_at ? new Date(scan.started_at).toLocaleString() : '—'}</span>
                          <span>•</span>
                          <span style={{ 
                            fontWeight: 500,
                            color: scan.status === 'completed' ? 'var(--success)' : 
                                   scan.status === 'failed' ? 'var(--error)' : 
                                   'var(--warning)' 
                          }}>
                            {scan.status ? scan.status.charAt(0).toUpperCase() + scan.status.slice(1) : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* BADGES */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '40%' }}>
                        {['critical', 'high', 'medium', 'low'].map(sev => counts[sev] > 0 && (
                          <span key={sev} style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.25rem', 
                            fontSize: '0.75rem', fontWeight: 600, color: SEVERITY_COLORS[sev], 
                            background: `${SEVERITY_COLORS[sev]}15`, 
                            padding: '0.25rem 0.625rem', borderRadius: '99px',
                            border: `1px solid ${SEVERITY_COLORS[sev]}30`
                          }}>
                            {counts[sev]} {sev.charAt(0).toUpperCase()}
                          </span>
                        ))}
                        {findings.length === 0 && scan.status === 'completed' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '0.25rem 0' }}>No findings</span>
                        )}
                        {scan.status !== 'completed' && scan.status !== 'failed' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--warning)', padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <div className="animate-spin" style={{ width: '10px', height: '10px', border: '2px solid var(--warning)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            In Progress
                          </span>
                        )}
                      </div>

                      <div style={{ color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* ACCORDION BODY */}
                    {isExpanded && (
                      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                        
                        {findings.length > 0 ? (
                          <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              Identified Findings
                            </h4>
                            {findings.map((f, idx) => {
                              const sev = f.raw_data?.severity?.toLowerCase() || 'info';
                              const SevIcon = SEVERITY_ICONS[sev] || Info;
                              return (
                                <div key={f.id || idx} style={{ 
                                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem', 
                                  padding: '1rem', background: 'var(--bg-secondary)', 
                                  borderRadius: 'var(--radius)', 
                                  borderLeft: `3px solid ${SEVERITY_COLORS[sev] || 'var(--text-tertiary)'}` 
                                }}>
                                  <SevIcon size={18} style={{ color: SEVERITY_COLORS[sev] || 'var(--text-tertiary)', marginTop: '0.125rem', flexShrink: 0 }} />
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                      {f.title}
                                    </div>
                                    {f.raw_data?.description && (
                                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {f.raw_data.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                           <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <Info size={16} />
                             {scan.status === 'completed' ? 'No vulnerabilities or significant findings detected.' : 'Scan results will appear here once strictly available.'}
                           </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                          <button className="btn-primary" onClick={(e) => handleScanClick(scan.id, e)}>
                            View Detailed Dashboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
