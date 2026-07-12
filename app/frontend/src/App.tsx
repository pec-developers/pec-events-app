import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLogin } from './pages/AdminLogin';
import { SpocLogin } from './pages/SpocLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { SpocDashboard } from './pages/SpocDashboard';
import { EventsBoard } from './components/EventsBoard';
import { CreateEventForm } from './components/CreateEventForm';
import { LogOut, User, ShieldCheck, Landmark, Hash, Mail, Loader2, Sparkles, PlusCircle } from 'lucide-react';

function App() {
  const { user, isAuthenticated, isLoading, checkSession, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'view-events' | 'create-event' | 'profile'>('view-events');
  
  // Custom light state router
  const [route, setRoute] = useState<string>(window.location.hash || window.location.pathname);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleLocationChange = () => {
      const currentRoute = window.location.hash || window.location.pathname;
      setRoute(currentRoute);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    
    // Initial check
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
    setActiveTab('view-events');
    window.location.hash = '';
  };

  // 1. Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Initializing session context...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Authenticated routing
  if (isAuthenticated && user) {
    const role = user.role.toUpperCase();

    // Route Admin to Admin Dashboard
    if (role === 'ADMIN') {
      return <AdminDashboard />;
    }

    // Route SPOC to SPOC Dashboard
    if (role === 'SPOC') {
      return <SpocDashboard />;
    }

    // Standard Events portal (Students, Faculty, and Coordinators)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        {/* Header */}
        <header style={{ 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border-color)', 
          padding: '1rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: 'var(--shadow-sm)', 
          flexWrap: 'wrap', 
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--accent)', color: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>PEC</div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Events Portal</h1>
          </div>

          {/* Centered Navigation Tabs */}
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('view-events')} 
              className={`btn ${activeTab === 'view-events' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Sparkles size={16} />
              View Events
            </button>
            <button 
              onClick={() => setActiveTab('create-event')} 
              className={`btn ${activeTab === 'create-event' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={16} />
              Create Event
            </button>
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <User size={16} />
              My Profile
            </button>
          </nav>

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
        <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1050px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
          {activeTab === 'view-events' && <EventsBoard />}
          
          {activeTab === 'create-event' && (
            <CreateEventForm onSuccess={() => setActiveTab('view-events')} />
          )}

          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Profile Info */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
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
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                    <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
                    Access Validation
                  </h3>
                  <div className="alert alert-success" style={{ margin: 0 }}>
                    <strong>Role Authorization:</strong> Active.
                    <br />
                    Logged in as <strong>{user.role}</strong>. You have permissions to navigate event boards and manage event interactions.
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  AOP-like role check verification has processed this session context successfully.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 3. Unauthenticated routing (Path/Hash checks)
  const isSpocRoute = route === '#spoc' || route === '/spoc' || route === '/spoc/login';
  const isAdminRoute = route === '#admin' || route === '/admin' || route === '/admin/login';

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {isSpocRoute ? (
        <SpocLogin onSuccess={() => {}} />
      ) : isAdminRoute ? (
        <AdminLogin onSuccess={() => {}} />
      ) : currentPage === 'login' ? (
        <Login
          onSuccess={() => {}}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      ) : (
        <Register
          onSuccess={() => {
            setCurrentPage('login');
          }}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}
    </div>
  );
}

export default App;
