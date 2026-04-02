import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function CommandBar() {
    const [input, setInput] = useState("");
    const [scanType, setScanType] = useState("auto");
    const [portRange, setPortRange] = useState("");
    const [protocol, setProtocol] = useState("TCP");
    const { user } = useUser();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && input.trim() !== "") {
            submitScan();
        }
    };

    const submitScan = () => {
        if (!input.trim()) return;

        let finalScanType = scanType;
        if (scanType === "auto") {
            const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(input.trim());
            finalScanType = isIp ? "IP_RECON" : "SSL/TLS";
        }

        const params = new URLSearchParams({
            q: input.trim(),
            type: finalScanType
        });

        if (finalScanType === "IP_PORT_SCAN") {
            if (portRange) params.append("port_range", portRange);
            if (protocol) params.append("protocol", protocol);
        }

        navigate(`/dashboard?${params.toString()}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="command-bar-wrapper" style={{ width: '100%' }} onClick={() => inputRef.current?.focus()}>
                <div className="command-bar">
                    <span className="prompt-prefix">scan &gt;</span>
                    <div className="visual-input">
                        {input}
                        <span className="typing-cursor"></span>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input-hidden"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck="false"
                        autoComplete="off"
                    />
                </div>
            </div>

            {user && (
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                    <select 
                        value={scanType} 
                        onChange={(e) => setScanType(e.target.value)}
                        className="custom-select"
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', color: 'var(--text-color)', border: '1px solid var(--border-color)', outline: 'none', flex: 1 }}
                    >
                        <option value="auto">Auto-detect (IP/Domain)</option>
                        <option value="IP_PORT_SCAN">IP Port Scan</option>
                    </select>

                    {scanType === "IP_PORT_SCAN" && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Port range (e.g. 1-1000)" 
                                value={portRange}
                                onChange={(e) => setPortRange(e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', color: 'var(--text-color)', border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                            <select 
                                value={protocol} 
                                onChange={(e) => setProtocol(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', color: 'var(--text-color)', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="TCP">TCP</option>
                                <option value="UDP">UDP</option>
                            </select>
                        </>
                    )}
                </div>
            )}
            
            <button 
                onClick={submitScan} 
                className="btn-primary" 
                style={{ width: '100%' }}
                disabled={!input.trim()}
            >
                Execute Scan
            </button>
        </div>
    );
}
