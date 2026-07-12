import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuthStore } from '../stores/authStore';
import { Calendar, Users, FileText, PlusCircle, CheckCircle, Loader2, DollarSign, Image, Eye, Globe } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess: () => void;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess }) => {
  const { createEvent, isLoading, error } = useEvents();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('50');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('0');
  const [deptScope, setDeptScope] = useState<'ONLY_DEPT' | 'ALL_DEPTS'>('ALL_DEPTS');
  const [bannerUrl, setBannerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check role: coordinators, SPOC, Admin can publish directly; regular students/faculty can only draft
  const isCoordinatorGroup = 
    user?.role === 'FACULTY_COORDINATOR' || 
    user?.role === 'STUDENT_COORDINATOR' || 
    user?.role === 'SPOC' || 
    user?.role === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent, submitAsDraft: boolean) => {
    e.preventDefault();
    setSuccessMsg('');

    try {
      await createEvent({
        title,
        description,
        capacity: parseInt(capacity, 10),
        date: new Date(date).toISOString(),
        price: parseFloat(price) || 0,
        departmentScope: deptScope,
        bannerImageUrl: bannerUrl || undefined,
        posterImageUrl: posterUrl || undefined,
        isDraft: submitAsDraft
      });

      setSuccessMsg(submitAsDraft ? 'Draft saved successfully!' : 'Event published successfully!');
      setTitle('');
      setDescription('');
      setCapacity('50');
      setDate('');
      setPrice('0');
      setDeptScope('ALL_DEPTS');
      setBannerUrl('');
      setPosterUrl('');
      
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
      }, 1500);
    } catch (err) {
      // Handled by store error
    }
  };

  return (
    <div className="form-card animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="text-center mb-6">
        <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1rem' }}>
          <PlusCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Create New Event</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isCoordinatorGroup 
            ? 'Publish directly to target departments or save as an event draft' 
            : 'Fill in event specifications to save as a draft for coordinator verification'}
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="alert" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label" htmlFor="evt-title">Event Title</label>
          <div style={{ position: 'relative' }}>
            <PlusCircle size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="evt-title"
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CodeStorm Hackathon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="evt-desc">Description</label>
          <div style={{ position: 'relative' }}>
            <FileText size={18} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--text-muted)' }} />
            <textarea
              id="evt-desc"
              className="form-input"
              style={{ paddingLeft: '40px', minHeight: '100px', resize: 'vertical', paddingTop: '12px' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe event schedules, eligibility, rules..."
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="evt-capacity">Seat Capacity</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="evt-capacity"
                type="number"
                min="1"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-date">Date & Time</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="evt-date"
                type="datetime-local"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="evt-price">Event Ticket Price (INR)</label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="evt-price"
                type="number"
                min="0"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0 for Free"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-scope">Target Audience / Visibility</label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                id="evt-scope"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={deptScope}
                onChange={(e) => setDeptScope(e.target.value as any)}
                disabled={isLoading}
              >
                <option value="ALL_DEPTS">All Departments (Open to Everyone)</option>
                <option value="ONLY_DEPT">My Department ({user?.department || 'CSE'} Only)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="evt-banner">Banner Image URL</label>
            <div style={{ position: 'relative' }}>
              <Image size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="evt-banner"
                type="url"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="evt-poster">Poster Image URL</label>
            <div style={{ position: 'relative' }}>
              <Image size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="evt-poster"
                type="url"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            id="draft-event-btn"
            type="button"
            className="btn btn-secondary"
            disabled={isLoading}
            onClick={(e) => handleSubmit(e, true)}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Eye size={16} style={{ marginRight: '6px' }} />
                Save as Draft
              </>
            )}
          </button>

          {isCoordinatorGroup && (
            <button
              id="create-event-btn"
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e, false)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                  Publishing...
                </>
              ) : (
                <>
                  <PlusCircle size={16} style={{ marginRight: '6px' }} />
                  Publish Event
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
