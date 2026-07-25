import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { EventsBoard } from '../components/EventsBoard';
import { ProfileEditor } from '../components/ProfileEditor';
import { LogOut, User, Sparkles } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'view-events' | 'profile'>('view-events');

  if (!user) return null;

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
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Student Portal</h1>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('view-events')} 
            className={`btn ${activeTab === 'view-events' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            Browse Events
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
          <button onClick={() => logout()} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1050px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
        {activeTab === 'view-events' && <EventsBoard />}
        {activeTab === 'profile' && <ProfileEditor />}
      </main>
    </div>
  );
};

export default StudentDashboard;
