import React, { useState } from 'react';
import { useRegister } from '../hooks/useAuth';
import { User, Mail, CreditCard, Phone, Lock, Loader2, UserPlus } from 'lucide-react';

interface RegisterProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNum, setRegNum] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleGroup, setRoleGroup] = useState<'student' | 'coordinator'>('student');
  const [coordinatorType, setCoordinatorType] = useState<'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'>('STUDENT_COORDINATOR');
  const { handleRegister, isLoading, error } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = roleGroup === 'student' ? 'STUDENT' : coordinatorType;
    const success = await handleRegister({
      name,
      email,
      registrationNumber: regNum,
      phoneNumber: phone || undefined,
      password,
      role: selectedRole
    });
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="form-card animate-fade-in" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <UserPlus size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join to register and organize events</p>
      </div>

      {/* Student vs Coordinator Toggle Bar */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-secondary)', 
        padding: '4px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-color)', 
        marginBottom: '1.5rem' 
      }}>
        <button
          type="button"
          onClick={() => setRoleGroup('student')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: roleGroup === 'student' ? 'var(--accent)' : 'transparent',
            color: roleGroup === 'student' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setRoleGroup('coordinator')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: roleGroup === 'coordinator' ? 'var(--accent)' : 'transparent',
            color: roleGroup === 'coordinator' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Coordinator
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {roleGroup === 'coordinator' && (
          <div className="form-group animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <label className="form-label" htmlFor="coordinator-type-select">Coordinator Type</label>
            <select
              id="coordinator-type-select"
              className="form-input"
              value={coordinatorType}
              onChange={(e) => setCoordinatorType(e.target.value as any)}
              disabled={isLoading}
              style={{ cursor: 'pointer' }}
            >
              <option value="STUDENT_COORDINATOR">Student Coordinator</option>
              <option value="FACULTY_COORDINATOR">Faculty Coordinator</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name-input">Full Name</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="reg-name-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email-input">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="reg-email-input"
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
          <label className="form-label" htmlFor="reg-num-input">Registration / Enrollment Number</label>
          <div style={{ position: 'relative' }}>
            <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="reg-num-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
              placeholder="PEC-100234"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-phone-input">Phone Number (Optional)</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="reg-phone-input"
              type="tel"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password-input">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="reg-password-input"
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
          id="register-submit-btn"
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign In
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
