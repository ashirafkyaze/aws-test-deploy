import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/products', { replace: true });
    } catch (err) {
      const message = (err?.message || '').toLowerCase();
      if (message.includes('wrong-password') || message.includes('invalid')) {
        setError('Incorrect password');
      } else if (message.includes('user-not-found') || message.includes('no user')) {
        setError('No account found with this email');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px -12px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 2rem 1.75rem',
            background: 'linear-gradient(to bottom, #f8fafc, white)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder=" "
              style={{
                width: '100%',
                padding: '1.1rem 1rem 0.7rem',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none',
                background: email ? '#f9fafb' : 'white',
              }}
              className="peer"
            />
            <label
              htmlFor="email"
              style={{
                position: 'absolute',
                left: '1rem',
                top: email || document.activeElement?.id === 'email' ? '0.4rem' : '1.1rem',
                fontSize: email || document.activeElement?.id === 'email' ? '0.78rem' : '1rem',
                color: email || document.activeElement?.id === 'email' ? '#6366f1' : '#9ca3af',
                pointerEvents: 'none',
                transition: 'all 0.2s ease',
                background: 'white',
                padding: '0 0.3rem',
              }}
            >
              Email address
            </label>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              style={{
                width: '100%',
                padding: '1.1rem 3.2rem 0.7rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s',
                outline: 'none',
                background: password ? '#f9fafb' : 'white',
              }}
              className="peer"
            />
            <label
              htmlFor="password"
              style={{
                position: 'absolute',
                left: '1rem',
                top: password || document.activeElement?.id === 'password' ? '0.4rem' : '1.1rem',
                fontSize: password || document.activeElement?.id === 'password' ? '0.78rem' : '1rem',
                color: password || document.activeElement?.id === 'password' ? '#6366f1' : '#9ca3af',
                pointerEvents: 'none',
                transition: 'all 0.2s ease',
                background: 'white',
                padding: '0 0.3rem',
              }}
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: '#6b7280',
                padding: 0,
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.9rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '1.3rem', lineHeight: 1 }}>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              background: loading ? '#a5b4fc' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            padding: '1.5rem 2rem 2.5rem',
            textAlign: 'center',
            borderTop: '1px solid #f1f5f9',
            color: '#6b7280',
            fontSize: '0.97rem',
          }}
        >
          New here?{' '}
          <Link
            to="/register"
            style={{
              color: '#4f46e5',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;