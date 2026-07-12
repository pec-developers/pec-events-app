import React, { useState } from 'react';
import { useForgotPassword, useResetPassword } from '../hooks/useAuth';
import { Mail, Phone, Lock, Loader2, KeyRound, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [phase, setPhase] = useState<'request' | 'reset'>('request');
  const [identity, setIdentity] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  
  // Reset password states
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { handleForgotPassword, isLoading: isRequestLoading, error: requestError } = useForgotPassword();
  const { handleResetPassword, isLoading: isResetLoading, error: resetError, success: resetSuccess } = useResetPassword();

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleForgotPassword(identity, channel);
    if (success) {
      setPhase('reset');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const success = await handleResetPassword(identity, otp, newPassword);
    if (success) {
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    }
  };

  const error = phase === 'request' ? requestError : resetError;
  const isLoading = phase === 'request' ? isRequestLoading : isResetLoading;

  return (
    <div className="form-card animate-fade-in" style={{ marginTop: '4rem', marginBottom: '4rem', maxWidth: '400px', width: '100%' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <KeyRound size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          {phase === 'request' ? 'Reset Password' : 'Verify & Reset'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {phase === 'request' 
            ? 'Get a verification code to recover access to your account' 
            : `Enter the code sent to your ${channel.toLowerCase()}`}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {resetSuccess && (
        <div className="alert alert-success" role="alert" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>Password reset successful! Redirecting to login...</span>
          </div>
        </div>
      )}

      {phase === 'request' ? (
        <form onSubmit={handleRequestSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identity-input">
              {channel === 'EMAIL' ? 'Email Address' : 'Phone Number'}
            </label>
            <div style={{ position: 'relative' }}>
              {channel === 'EMAIL' ? (
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              ) : (
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              )}
              <input
                id="identity-input"
                type={channel === 'EMAIL' ? 'email' : 'tel'}
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder={channel === 'EMAIL' ? 'yourname@example.com' : '+91XXXXXXXXXX'}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Channel Toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setChannel('EMAIL');
                setIdentity('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: channel === 'EMAIL' ? 'var(--accent-glow)' : 'transparent',
                color: channel === 'EMAIL' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Email Option
            </button>
            <button
              type="button"
              onClick={() => {
                setChannel('SMS');
                setIdentity('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: channel === 'SMS' ? 'var(--accent-glow)' : 'transparent',
                color: channel === 'SMS' ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              SMS Option
            </button>
          </div>

          <button
            id="forgot-password-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="otp-input">Verification Code (OTP)</label>
            <input
              id="otp-input"
              type="text"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              required
              disabled={isLoading || resetSuccess}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password-input">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="new-password-input"
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading || resetSuccess}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password-input">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="confirm-password-input"
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading || resetSuccess}
              />
            </div>
          </div>

          <button
            id="reset-password-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || resetSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0 0', paddingTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <button 
          onClick={onNavigateToLogin} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          <ChevronLeft size={16} /> Back to Login
        </button>
      </div>
    </div>
  );
};
