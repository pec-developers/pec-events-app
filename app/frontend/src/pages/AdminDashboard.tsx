import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEventStore } from '../stores/eventStore';
import { 
  LogOut, Plus, Trash2, Edit2, Landmark, Mail, Lock, 
  Settings, Sparkles, User, Calendar, DollarSign, Users, RefreshCw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, spocs, fetchSPOCs, createSPOC, updateSPOC, deleteSPOC, logout, error: authError } = useAuthStore();
  const { events, fetchEvents, deleteEvent, error: eventError } = useEventStore();

  const [activeTab, setActiveTab] = useState<'spocs' | 'events'>('spocs');
  
  // SPOC form states
  const [showSpocForm, setShowSpocForm] = useState(false);
  const [editingSpocId, setEditingSpocId] = useState<string | null>(null);
  const [spocName, setSpocName] = useState('');
  const [spocEmail, setSpocEmail] = useState('');
  const [spocDept, setSpocDept] = useState('CSE');
  const [spocPassword, setSpocPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const departments = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL'];

  useEffect(() => {
    fetchSPOCs();
    fetchEvents();
  }, [fetchSPOCs, fetchEvents]);

  const handleOpenCreateForm = () => {
    setEditingSpocId(null);
    setSpocName('');
    setSpocEmail('');
    setSpocDept('CSE');
    setSpocPassword('');
    setFormError(null);
    setShowSpocForm(true);
  };

  const handleOpenEditForm = (spoc: any) => {
    setEditingSpocId(spoc.userId);
    setSpocName(spoc.name);
    setSpocEmail(spoc.email);
    setSpocDept(spoc.department);
    setSpocPassword(''); // Clear for security, only change if typed
    setFormError(null);
    setShowSpocForm(true);
  };

  const handleSpocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate if creating and department already has SPOC
    if (!editingSpocId) {
      const alreadyHasSPOC = spocs.some(s => s.department?.toUpperCase() === spocDept.toUpperCase());
      if (alreadyHasSPOC) {
        setFormError(`A SPOC already exists for the ${spocDept} department.`);
        return;
      }
    }

    try {
      if (editingSpocId) {
        await updateSPOC(editingSpocId, {
          name: spocName,
          email: spocEmail,
          department: spocDept,
          password: spocPassword || undefined
        });
      } else {
        await createSPOC({
          name: spocName,
          email: spocEmail,
          department: spocDept,
          password: spocPassword || 'password123'
        });
      }
      setShowSpocForm(false);
      fetchSPOCs();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    }
  };

  const handleDeleteSpoc = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete the SPOC "${name}"?`)) {
      try {
        await deleteSPOC(userId);
        fetchSPOCs();
      } catch (err: any) {
        alert(err.message || 'Failed to delete SPOC');
      }
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the event "${title}"?`)) {
      try {
        await deleteEvent(eventId);
        fetchEvents();
      } catch (err: any) {
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = '';
  };

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
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--accent)', color: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>PEC</div>
          <div>
            <h1 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Admin Portal
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', backgroundColor: 'rgba(168, 0, 0, 0.1)', color: 'var(--accent)', borderRadius: '100px' }}>Root Control</span>
            </h1>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('spocs')} 
            className={`btn ${activeTab === 'spocs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Landmark size={16} />
            Manage SPOCs
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Calendar size={16} />
            Moderate Events
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' } as any}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'Administrator'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Administrative Context */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {(authError || eventError) && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {authError || eventError}
          </div>
        )}

        {/* Tab 1: SPOC CRUD panel */}
        {activeTab === 'spocs' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Department SPOC Registry</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Deploy one SPOC for CSE, ECE, EEE, IT, etc. to delegate departmental controls</p>
              </div>
              <button onClick={handleOpenCreateForm} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} />
                Deploy SPOC
              </button>
            </div>

            {/* SPOC Form Drawer/Modal */}
            {showSpocForm && (
              <div className="form-card animate-fade-in" style={{ marginBottom: '2rem', maxWidth: '600px', border: '1px solid var(--accent)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                  {editingSpocId ? 'Edit SPOC Credentials' : 'Register New SPOC'}
                </h3>
                {formError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    {formError}
                  </div>
                )}
                <form onSubmit={handleSpocSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={spocName} 
                        onChange={(e) => setSpocName(e.target.value)} 
                        placeholder="Dr. Rajesh Kumar" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <select 
                        className="form-input" 
                        value={spocDept} 
                        onChange={(e) => setSpocDept(e.target.value)}
                        disabled={!!editingSpocId}
                      >
                        {departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={spocEmail} 
                        onChange={(e) => setSpocEmail(e.target.value)} 
                        placeholder="rajesh@pec.edu" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Password {editingSpocId && '(Leave blank to keep same)'}</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={spocPassword} 
                        onChange={(e) => setSpocPassword(e.target.value)} 
                        placeholder={editingSpocId ? '••••••••' : 'password123'} 
                        required={!editingSpocId} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowSpocForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                      {editingSpocId ? 'Update SPOC' : 'Create & Assign SPOC'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SPOCs Listing Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {spocs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Landmark size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No SPOCs deployed yet. Click "Deploy SPOC" above to provision one.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Department</th>
                        <th style={{ padding: '1rem' }}>System Role</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spocs.map((spoc) => (
                        <tr key={spoc.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{spoc.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{spoc.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                              {spoc.department}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{spoc.role}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleOpenEditForm(spoc)} 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteSpoc(spoc.userId, spoc.name)} 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '0.35rem 0.6rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Events Moderation panel */}
        {activeTab === 'events' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System-wide Event Auditing</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Review, edit, and moderate events published across all departments</p>
              </div>
              <button onClick={() => fetchEvents()} className="btn btn-secondary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} />
                Refresh Board
              </button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {events.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No events exist in the system yet.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Event Title</th>
                        <th style={{ padding: '1rem' }}>Dept / Scope</th>
                        <th style={{ padding: '1rem' }}>Date & Time</th>
                        <th style={{ padding: '1rem' }}>Capacity</th>
                        <th style={{ padding: '1rem' }}>Price</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600 }}>{event.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '280px' }}>
                              {event.description}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', marginRight: '0.5rem' }}>
                              {event.department}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              {event.departmentScope === 'ALL_DEPTS' ? 'All Depts' : 'Dept Only'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Users size={14} />
                              {event.registrationsCount} / {event.capacity}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>
                            {event.price === 0 ? (
                              <span style={{ color: '#10b981' }}>Free</span>
                            ) : (
                              `₹${event.price}`
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '100px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600, 
                              backgroundColor: event.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: event.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'
                            }}>
                              {event.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDeleteEvent(event.id, event.title)} 
                              className="btn btn-secondary" 
                              style={{ width: 'auto', padding: '0.35rem 0.6rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
