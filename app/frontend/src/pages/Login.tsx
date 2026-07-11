import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(email, password);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="form-card animate-fade-in" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to manage and register for campus events</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email-input">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="email-input"
              type="email"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@pec.edu"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password-input">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="password-input"
              type="password"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
        <button
          type="button"
          onClick={onNavigateToRegister}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign Up
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
