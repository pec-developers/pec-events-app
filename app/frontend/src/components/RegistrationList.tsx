import { useEffect, useState } from 'react';
import { getEventRegistrations } from '../api/event';
import type { RegistrationDetailResponse } from '../api/event.types';
import { Download, Loader2, ClipboardList, CheckSquare, Square } from 'lucide-react';

interface RegistrationListProps {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

export function RegistrationList({ eventId, eventTitle, onBack }: RegistrationListProps) {
  const [registrations, setRegistrations] = useState<RegistrationDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CSV Field selection states (defaults to all selected)
  const columns = [
    { key: 'studentRegNum', label: 'Registration Number' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'studentEmail', label: 'Email Address' },
    { key: 'studentDept', label: 'Department' },
    { key: 'status', label: 'Registration Status' },
    { key: 'createdAt', label: 'Registered Date' },
    { key: 'id', label: 'Registration ID' }
  ] as const;

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map(c => c.key)
  );

  useEffect(() => {
    const fetchRegs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getEventRegistrations(eventId);
        setRegistrations(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event registrations.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegs();
  }, [eventId]);

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    // Header row
    const selectedHeaders = columns
      .filter(c => selectedColumns.includes(c.key))
      .map(c => c.label);

    const csvRows = [selectedHeaders.join(',')];

    // Data rows
    registrations.forEach(reg => {
      const values = columns
        .filter(c => selectedColumns.includes(c.key))
        .map(c => {
          const val = reg[c.key as keyof RegistrationDetailResponse] || '';
          // Escape quotes/commas
          const cleanVal = String(val).replace(/"/g, '""');
          return `"${cleanVal}"`;
        });
      csvRows.push(values.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrations_${eventTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={onBack} className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            ← Back to Board
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Registrations: {eventTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Verify registered students, manage lists, and export records with custom fields.
          </p>
        </div>

        {registrations.length > 0 && (
          <button 
            onClick={handleExportCSV} 
            disabled={selectedColumns.length === 0}
            className="btn btn-primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} />
            Export Selected to CSV
          </button>
        )}
      </div>

      {/* CSV Column Customizer */}
      {registrations.length > 0 && (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1.5rem', 
          boxShadow: 'var(--shadow-sm)' 
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Choose columns to include in the CSV export:</h4>
          <div style={{ display: 'flex', gap: '1rem 1.5rem', flexWrap: 'wrap' }}>
            {columns.map(col => {
              const isSelected = selectedColumns.includes(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem',
                    fontSize: '0.85rem',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  {isSelected ? (
                    <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                  ) : (
                    <Square size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Registrations List Table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading registration data...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent)' }}>
            <p>{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>No students registered for this event yet.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem' }}>Reg No</th>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Registered Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{reg.studentRegNum}</td>
                    <td style={{ padding: '1rem' }}>{reg.studentName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.studentEmail}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
                        {reg.studentDept}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(reg.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: reg.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: reg.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'
                      }}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
