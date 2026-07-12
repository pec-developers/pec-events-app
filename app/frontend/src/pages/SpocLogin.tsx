import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Mail, Lock, Loader2, Landmark } from 'lucide-react';

interface SpocLoginProps {
  onSuccess: () => void;
}

export const SpocLogin: React.FC<SpocLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(email, password, 'spoc');
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="form-card animate-fade-in" style={{ marginTop: '4rem', marginBottom: '4rem', maxWidth: '400px', width: '100%' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(168, 0, 0, 0.1)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <Landmark size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>SPOC Portal</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to manage coordinators and participants in your department</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="spoc-email">SPOC Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="spoc-email"
              type="email"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cse_spoc@pec.edu"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="spoc-password">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="spoc-password"
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
          id="spoc-login-submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--accent)', border: '1px solid var(--accent)' }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Verifying...
            </>
          ) : (
            'Access Department Control'
          )}
        </button>
      </form>

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0 0', paddingTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }} onClick={() => window.location.hash = ''}>
          &larr; Back to General Portal
        </a>
      </div>
    </div>
  );
};
