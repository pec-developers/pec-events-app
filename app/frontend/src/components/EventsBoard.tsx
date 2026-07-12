import React, { useEffect, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuthStore } from '../stores/authStore';
import { 
  Calendar, Users, CheckCircle, AlertTriangle, Trash2, 
  Loader2, Sparkles, Inbox, Edit3, Save, X, Globe, Landmark, BadgeAlert
} from 'lucide-react';

export const EventsBoard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    events,
    registrations,
    isLoading,
    error,
    fetchEvents,
    registerForEvent,
    fetchUserRegistrations,
    cancelRegistration,
    publishEvent,
    updateEvent,
    deleteEvent
  } = useEvents();

  // Inline editing state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCapacity, setEditCapacity] = useState('50');
  const [editDate, setEditDate] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editScope, setEditScope] = useState<'ONLY_DEPT' | 'ALL_DEPTS'>('ALL_DEPTS');

  useEffect(() => {
    fetchEvents();
    fetchUserRegistrations();
  }, [fetchEvents, fetchUserRegistrations]);

  const handleRegister = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
    } catch (err) {
      // Handled by store error
    }
  };

  const handleCancel = async (regId: string) => {
    if (confirm('Are you sure you want to cancel your registration?')) {
      try {
        await cancelRegistration(regId);
      } catch (err) {
        // Handled by store error
      }
    }
  };

  const handlePublish = async (eventId: string) => {
    if (confirm('Are you sure you want to publish this event draft? it will become visible to all targeted participants.')) {
      try {
        await publishEvent(eventId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to publish draft');
      }
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to delete the event "${title}"?`)) {
      try {
        await deleteEvent(eventId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete event');
      }
    }
  };

  const handleStartEdit = (event: any) => {
    setEditingEventId(event.id);
    setEditTitle(event.title);
    setEditDesc(event.description);
    setEditCapacity(event.capacity.toString());
    
    // Format date string for input local
    try {
      const d = new Date(event.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setEditDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } catch (e) {
      setEditDate(event.date);
    }
    setEditPrice(event.price.toString());
    setEditScope(event.departmentScope);
  };

  const handleSaveEdit = async (eventId: string) => {
    try {
      await updateEvent(eventId, {
        title: editTitle,
        description: editDesc,
        capacity: parseInt(editCapacity, 10) || 50,
        date: new Date(editDate).toISOString(),
        price: parseFloat(editPrice) || 0,
        departmentScope: editScope
      });
      setEditingEventId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getUserRegistration = (eventId: string) => {
    return registrations.find(r => r.eventId === eventId);
  };

  // Roles verification
  const isEligibleToRegister = user?.role === 'STUDENT' || user?.role === 'STUDENT_COORDINATOR';
  const role = user?.role?.toUpperCase() || '';
  const isCoordinatorGroup = 
    role === 'FACULTY_COORDINATOR' || 
    role === 'STUDENT_COORDINATOR' || 
    role === 'SPOC' || 
    role === 'ADMIN';

  // Check delete/edit permissions
  const canModifyEvent = (event: any) => {
    if (role === 'ADMIN') return true;
    if (role === 'SPOC' && event.department?.toUpperCase() === user?.department?.toUpperCase()) return true;
    return event.creatorId === user?.userId;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Active Events Board */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} style={{ color: 'var(--accent)' }} />
              Active Events Board
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Discover and register for ongoing and upcoming campus events</p>
          </div>
          {isLoading && events.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Loader2 className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Syncing board...
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>No Events Published</h4>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.875rem', margin: 0 }}>
              There are currently no active events matching your accessibility settings. If you are a Coordinator, navigate to the "Create Event" tab to publish one.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {events.map((event) => {
              const userReg = getUserRegistration(event.id);
              const remainingSlots = event.capacity - event.registrationsCount;
              const isFull = remainingSlots <= 0;
              const isEditing = editingEventId === event.id;

              if (isEditing) {
                // Card Inline Edit Mode
                return (
                  <div key={event.id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--accent)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' } as any}>
                      <span>Modify Event Details</span>
                      <button onClick={() => setEditingEventId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' } as any}>
                        <X size={16} />
                      </button>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Title</label>
                      <input type="text" className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                      <textarea className="form-input" style={{ minHeight: '60px' }} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Capacity</label>
                        <input type="number" className="form-input" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Price (INR)</label>
                        <input type="number" className="form-input" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Date & Time</label>
                      <input type="datetime-local" className="form-input" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Visibility Scope</label>
                      <select className="form-input" value={editScope} onChange={(e) => setEditScope(e.target.value as any)}>
                        <option value="ALL_DEPTS">All Departments</option>
                        <option value="ONLY_DEPT">Only my department ({event.department})</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => setEditingEventId(null)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}>Cancel</button>
                      <button onClick={() => handleSaveEdit(event.id)} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Save size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              // Card Normal View Mode
              return (
                <div key={event.id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: event.status === 'DRAFT' ? '1px dashed var(--accent)' : '1px solid var(--border-color)' }}>
                  
                  {/* Event Banner */}
                  {event.bannerImageUrl && (
                    <div style={{ margin: '-1.5rem -1.5rem 1rem -1.5rem', height: '120px', overflow: 'hidden', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', position: 'relative' }}>
                      <img src={event.bannerImageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {event.status === 'DRAFT' && (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '100px', 
                            backgroundColor: 'rgba(245, 158, 11, 0.15)', 
                            color: '#f59e0b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            <BadgeAlert size={12} />
                            Draft
                          </span>
                        )}
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '100px', 
                          backgroundColor: isFull ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          color: isFull ? '#ef4444' : '#10b981' 
                        }}>
                          {isFull ? 'Waiting List' : 'Slots Available'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} />
                        {remainingSlots > 0 ? `${remainingSlots} left` : 'Full'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{event.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                      {event.description}
                    </p>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <Landmark size={12} />
                        {event.department} scope
                      </span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <Globe size={12} />
                        {event.departmentScope === 'ALL_DEPTS' ? 'All Departments' : 'Dept Only'}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                      <Calendar size={14} style={{ color: 'var(--accent)' }} />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    {/* Action Panel for Participant vs Coordinator/Auditor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      
                      {/* 1. Attendee Register actions */}
                      {isEligibleToRegister && event.status === 'PUBLISHED' && (
                        userReg ? (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            padding: '0.6rem', 
                            borderRadius: 'var(--radius-sm)', 
                            backgroundColor: userReg.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: userReg.status === 'CONFIRMED' ? '#10b981' : '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}>
                            {userReg.status === 'CONFIRMED' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            <span>{userReg.status === 'CONFIRMED' ? 'Registered & Confirmed' : 'On Waiting List'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.id)}
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', padding: '0.6rem' }}
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : isFull ? (
                              'Join Waiting List'
                            ) : (
                              'Register Now'
                            )}
                          </button>
                        )
                      )}

                      {isEligibleToRegister && event.status === 'DRAFT' && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          Draft Event (Registration not open)
                        </div>
                      )}

                      {!isEligibleToRegister && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          Admins/SPOCs cannot register
                        </div>
                      )}

                      {/* 2. Coordinator Publish Draft options */}
                      {isCoordinatorGroup && event.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(event.id)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          Publish Draft Event
                        </button>
                      )}

                      {/* 3. Administrative Audit options (Edit / Delete) */}
                      {canModifyEvent(event) && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                          <button
                            onClick={() => handleStartEdit(event)}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id, event.title)}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Registrations Section */}
      {isEligibleToRegister && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} style={{ color: 'var(--success)' }} />
            My Registrations
          </h3>

          {registrations.length === 0 ? (
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              You haven't registered for any events yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {registrations.map((reg) => (
                <div key={reg.id} className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-secondary)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700 }}>{reg.eventTitle}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered on {new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                       fontSize: '0.8rem', 
                       fontWeight: 600, 
                       padding: '0.3rem 0.75rem', 
                       borderRadius: '100px', 
                       backgroundColor: reg.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                       color: reg.status === 'CONFIRMED' ? '#10b981' : '#f59e0b',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.25rem'
                     }}>
                      {reg.status === 'CONFIRMED' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      {reg.status === 'CONFIRMED' ? 'Confirmed' : 'Waiting List'}
                    </span>

                    <button
                      onClick={() => handleCancel(reg.id)}
                      disabled={isLoading}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={15} />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
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
