import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { KeyRound, Mail, Shield, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, requestPasswordReset, resetPassword } = useUser();
  const navigate = useNavigate();

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  const pageCopy = {
    login: {
      icon: Shield,
      title: 'Welcome Back',
      subtitle: 'Sign in to access advanced features',
      button: 'Sign In',
    },
    register: {
      icon: UserPlus,
      title: 'Create Account',
      subtitle: 'Register to get started',
      button: 'Create Account',
    },
    forgot: {
      icon: Mail,
      title: 'Reset Password',
      subtitle: 'Generate a reset token for your account',
      button: 'Send Reset Token',
    },
    reset: {
      icon: KeyRound,
      title: 'Set New Password',
      subtitle: 'Enter your reset token and new password',
      button: 'Update Password',
    },
  };

  const ActiveIcon = pageCopy[mode].icon;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if ((isRegister || isReset) && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if ((isRegister || isReset) && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else if (isRegister) {
      result = await register(name, email, password);
    } else if (isForgot) {
      result = await requestPasswordReset(email);
    } else {
      result = await resetPassword(resetToken, password);
    }

    setLoading(false);

    if (!result?.ok) {
      setError(result?.message || 'Something went wrong. Please try again.');
      return;
    }

    if (isLogin || isRegister) {
      navigate('/');
      return;
    }

    if (isForgot) {
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setNotice('Reset token generated. Use it to set a new password.');
      } else {
        setNotice(result.message);
      }
      setMode('reset');
      return;
    }

    setNotice('Password updated. You can sign in with the new password.');
    setMode('login');
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <div className="auth-header">
          <ActiveIcon size={32} />
          <h2>{pageCopy[mode].title}</h2>
          <p>{pageCopy[mode].subtitle}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {notice && <div className="auth-success">{notice}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                className="form-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {!isReset && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {isReset && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-reset-token">Reset Token</label>
              <input
                id="auth-reset-token"
                className="form-input"
                type="text"
                placeholder="Paste reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>
          )}

          {!isForgot && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-password">
                {isReset ? 'New Password' : 'Password'}
              </label>
              <input
                id="auth-password"
                className="form-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isLogin ? undefined : 8}
                required
              />
            </div>
          )}

          {(isRegister || isReset) && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                className="form-input"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : pageCopy[mode].button}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin && (
            <>
              <button onClick={() => switchMode('register')}>
                {"Don't have an account? "}
                <span>Register</span>
              </button>
              <button onClick={() => switchMode('forgot')}>
                <span>Forgot password?</span>
              </button>
            </>
          )}
          {isRegister && (
            <button onClick={() => switchMode('login')}>
              {'Already have an account? '}
              <span>Sign In</span>
            </button>
          )}
          {(isForgot || isReset) && (
            <button onClick={() => switchMode('login')}>
              {'Remembered it? '}
              <span>Sign In</span>
            </button>
          )}
          {isForgot && (
            <button onClick={() => switchMode('reset')}>
              <span>I have a reset token</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
