import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import PreviousScans from './pages/PreviousScans';
import DocsPage from './pages/DocsPage';
import FileSecurityPage from './pages/FileSecurityPage';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <Router>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/results" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/scans" element={<PreviousScans />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="/file-security" element={<FileSecurityPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
