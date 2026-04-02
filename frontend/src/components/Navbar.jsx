import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { Sun, Moon, Shield, LogIn, LogOut, User as UserIcon, Menu, X, Home, History, BookOpen, FileSearch } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/scans', label: 'Previous Scans', icon: History, protected: true },
    { path: '/docs', label: 'Documentation', icon: BookOpen },
    { path: '/file-security', label: 'File Security', icon: FileSearch, badge: 'Beta' },
  ];

  return (
    <nav className="navbar" id="main-navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <Shield size={20} />
          <span>SecPlatform</span>
        </Link>

        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(({ path, label, icon: Icon, protected: isProtected, badge }) => (
            <li key={path}>
              <Link
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={15} />
                {label}
                {badge && <span className="badge">{badge}</span>}
                {isProtected && !user && <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>Auth</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-right">
        <button
          onClick={toggleTheme}
          className="btn-icon"
          aria-label="Toggle theme"
          id="theme-toggle"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="nav-divider" />

        {user ? (
          <div className="user-menu">
            <div className="user-info">
              <UserIcon size={14} />
              <span>Authenticated</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost" id="logout-btn">
              <LogOut size={15} />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn-primary" id="auth-btn">
            <LogIn size={15} />
            Sign In
          </Link>
        )}

        <button
          className="btn-icon nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>
  );
}
