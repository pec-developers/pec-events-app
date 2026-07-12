import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Mail, Lock, Loader2, Sparkles, User, ShieldAlert, BookOpen } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
  onNavigateToForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleGroup, setRoleGroup] = useState<'student' | 'faculty' | 'coordinator'>('student');
  const { handleLogin, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleLogin(email, password, roleGroup);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="form-card animate-fade-in" style={{ marginTop: '3rem', marginBottom: '3rem', maxWidth: '420px', width: '100%' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <Sparkles size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to discover and register for campus events</p>
      </div>

      {/* 3 Toggle options: Student, Faculty, Coordinator */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-secondary)', 
        padding: '4px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-color)', 
        marginBottom: '1.5rem',
        gap: '2px'
      }}>
        <button
          type="button"
          onClick={() => setRoleGroup('student')}
          style={{
            flex: 1,
            padding: '0.5rem 0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: roleGroup === 'student' ? 'var(--accent)' : 'transparent',
            color: roleGroup === 'student' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <User size={12} />
          Student
        </button>
        <button
          type="button"
          onClick={() => setRoleGroup('faculty')}
          style={{
            flex: 1,
            padding: '0.5rem 0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: roleGroup === 'faculty' ? 'var(--accent)' : 'transparent',
            color: roleGroup === 'faculty' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <BookOpen size={12} />
          Faculty
        </button>
        <button
          type="button"
          onClick={() => setRoleGroup('coordinator')}
          style={{
            flex: 1,
            padding: '0.5rem 0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: roleGroup === 'coordinator' ? 'var(--accent)' : 'transparent',
            color: roleGroup === 'coordinator' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <ShieldAlert size={12} />
          Coordinator
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
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
        <button
          type="button"
          onClick={onNavigateToForgotPassword}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Forgot Password?
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0 0.5rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <a href="#spoc" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }} onClick={() => window.location.hash = '#spoc'}>
          SPOC Portal Login &rarr;
        </a>
        <a href="#admin" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }} onClick={() => window.location.hash = '#admin'}>
          Admin Portal Login &rarr;
        </a>
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
