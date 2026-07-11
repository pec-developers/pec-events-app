import React, { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LogOut, User, ShieldCheck, Landmark, Hash, Mail, Loader2 } from 'lucide-react';

function App() {
  const { user, isAuthenticated, isLoading, checkSession, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Initializing session...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--accent)', color: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>PEC</div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Events Portal</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>{user.role}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Profile Info */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--accent)' }} />
                Your Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMAIL</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Hash size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REGISTRATION NUMBER</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.registrationNumber || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Landmark size={18} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEPARTMENT</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user.department || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Role-based Area */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
                  Access Validation
                </h3>
                <div className="alert alert-success" style={{ margin: 0 }}>
                  <strong>Authentication Status:</strong> Active & Healthy.
                  <br />
                  Your current role <strong>{user.role}</strong> grants you full access to participant features.
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Role Verification aspect has processed this session context successfully.
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // Not logged in: show login or register page
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {currentPage === 'login' ? (
        <Login
          onSuccess={() => {}}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      ) : (
        <Register
          onSuccess={() => {}}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}
    </div>
  );
}

export default App;
