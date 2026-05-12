import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Hash, Sparkles } from 'lucide-react';

export default function FileSecurityPage() {
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [computing, setComputing] = useState(false);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef(null);

  const computeHash = useCallback(async (selectedFile) => {
    setComputing(true);
    setFile(selectedFile);
    setHashes(null);

    try {
      const buffer = await selectedFile.arrayBuffer();

      // SHA-256
      const sha256Buf = await crypto.subtle.digest('SHA-256', buffer);
      const sha256 = Array.from(new Uint8Array(sha256Buf)).map(b => b.toString(16).padStart(2, '0')).join('');

      // SHA-1
      const sha1Buf = await crypto.subtle.digest('SHA-1', buffer);
      const sha1 = Array.from(new Uint8Array(sha1Buf)).map(b => b.toString(16).padStart(2, '0')).join('');

      // MD5 — not natively supported by crypto.subtle, compute a simple one
      // For production use a library; here we compute SHA-384 as a third hash
      const sha384Buf = await crypto.subtle.digest('SHA-384', buffer);
      const sha384 = Array.from(new Uint8Array(sha384Buf)).map(b => b.toString(16).padStart(2, '0')).join('');

      setHashes({
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(2) + ' KB',
        sha256,
        sha1,
        sha384,
      });
    } catch (err) {
      console.error('Hash computation failed:', err);
    } finally {
      setComputing(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) computeHash(droppedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) computeHash(selectedFile);
  };

  return (
    <div className="container">
      <div className="file-security-page">
        <h1>
          File Security
          <span className="coming-soon-badge"><Sparkles size={11} /> Beta</span>
        </h1>
        <p className="page-subtitle">
          Drop a file to compute its cryptographic hashes. OSINT/MISP integration coming soon.
        </p>

        {/* Dropzone */}
        <div
          className={`dropzone ${dragover ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          id="file-dropzone"
        >
          <Upload size={36} />
          <span className="dropzone-text">
            {computing ? 'Computing hashes...' : 'Drop a file here or click to browse'}
          </span>
          <span className="dropzone-hint">Any file type — processed entirely client-side</span>
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
        </div>

        {/* Hash Results */}
        {hashes && (
          <div className="hash-results">
            <h3>
              <Hash size={16} />
              {hashes.name}
              <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 'auto', fontSize: '0.75rem' }}>
                {hashes.size}
              </span>
            </h3>
            <div className="hash-row">
              <span className="hash-label">SHA-256</span>
              <span className="hash-value">{hashes.sha256}</span>
            </div>
            <div className="hash-row">
              <span className="hash-label">SHA-1</span>
              <span className="hash-value">{hashes.sha1}</span>
            </div>
            <div className="hash-row">
              <span className="hash-label">SHA-384</span>
              <span className="hash-value">{hashes.sha384}</span>
            </div>

            {/* OSINT Placeholder */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={16} className="text-warning" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                MISP / VirusTotal lookup integration will be available in a future release.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
