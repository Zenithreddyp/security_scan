import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Terminal({ command, isScanning, scanProgress, scanLogs, scanComplete }) {
  const [displayedCommand, setDisplayedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);
  const prevCommandRef = useRef('');

  useEffect(() => {
    if (isScanning) return;
    const newCmd = command || '';
    const prevCmd = prevCommandRef.current;

    if (newCmd.startsWith(prevCmd) && newCmd.length > prevCmd.length) {
      const diff = newCmd.slice(prevCmd.length);
      let i = 0;
      setIsTyping(true);
      const interval = setInterval(() => {
        i++;
        setDisplayedCommand(prevCmd + diff.slice(0, i));
        if (i >= diff.length) { clearInterval(interval); setIsTyping(false); }
      }, 28);
      prevCommandRef.current = newCmd;
      return () => clearInterval(interval);
    }

    if (newCmd !== prevCmd) {
      let i = 0;
      setIsTyping(true);
      setDisplayedCommand('');
      const interval = setInterval(() => {
        i++;
        setDisplayedCommand(newCmd.slice(0, i));
        if (i >= newCmd.length) { clearInterval(interval); setIsTyping(false); }
      }, 22);
      prevCommandRef.current = newCmd;
      return () => clearInterval(interval);
    }
  }, [command, isScanning]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [scanLogs, scanProgress]);

  const renderCmd = (cmd) => {
    if (!cmd) return null;
    const parts = cmd.split(/(\s+)/);
    let first = true;
    return parts.map((p, i) => {
      if (p.match(/^\s+$/)) return <span key={i}>{p}</span>;
      if (first) { first = false; return <span key={i} className="cmd-name">{p}</span>; }
      if (p.startsWith('--')) return <span key={i} className="cmd-flag">{p}</span>;
      return <span key={i} className="cmd-value">{p}</span>;
    });
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-dots">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
        </div>
        <span className="terminal-title">security-scan — terminal</span>
        <div style={{ width: '3rem' }} />
      </div>
      <div className="terminal-body" ref={bodyRef}>
        <div className="terminal-line">
          <span className="terminal-log info">Security Scan Platform v1.0 — configure your scan on the left panel</span>
        </div>
        <div className="terminal-line" style={{ marginTop: '0.75rem' }}>
          <span className="terminal-prompt">
            <span className="user">user</span><span className="separator">@</span>
            <span className="user">security-scan</span><span className="separator">:</span>
            <span className="path">~</span><span className="dollar">$</span>
          </span>
          <span className="terminal-command"> {renderCmd(displayedCommand)}</span>
          {!isScanning && !scanComplete && <span className="terminal-cursor" />}
        </div>

        {isScanning && (
          <>
            <div style={{ marginTop: '0.75rem' }} />
            {scanLogs.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className={`terminal-log ${log.type || ''}`}>
                  <span className="log-prefix">{log.prefix || '[*]'}</span>{log.text}
                </span>
              </div>
            ))}
            <div className="terminal-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
              </div>
              <span className="progress-percentage">{scanProgress}%</span>
            </div>
          </>
        )}

        {scanComplete && (
          <>
            <div style={{ marginTop: '0.75rem' }} />
            {scanLogs.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className={`terminal-log ${log.type || ''}`}>
                  <span className="log-prefix">{log.prefix || '[*]'}</span>{log.text}
                </span>
              </div>
            ))}
            <div className="terminal-line" style={{ marginTop: '0.5rem' }}>
              <span className="terminal-complete">
                <CheckCircle2 size={14} /> Scan complete — results rendered below
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
