import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  LogOut, Plus, Trash2, Edit2, ShieldAlert, Users, 
  Hash, UserPlus
} from 'lucide-react';

export const SpocDashboard: React.FC = () => {
  const { 
    user, coordinators, deptUsers, fetchCoordinators, createCoordinator, 
    updateCoordinator, deleteCoordinator, fetchDeptUsers, createDeptUser, 
    updateDeptUser, deleteDeptUser, logout, error: authError 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'coordinators' | 'users'>('coordinators');
  
  // Coordinator form states
  const [showCoordForm, setShowCoordForm] = useState(false);
  const [editingCoordId, setEditingCoordId] = useState<string | null>(null);
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordRole, setCoordRole] = useState<'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'>('STUDENT_COORDINATOR');
  const [coordRegNum, setCoordRegNum] = useState('');
  const [coordPassword, setCoordPassword] = useState('');
  const [coordFormError, setCoordFormError] = useState<string | null>(null);

  // General user form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [userRegNum, setUserRegNum] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const userDept = user?.department || 'CSE';

  useEffect(() => {
    fetchCoordinators(userDept);
    fetchDeptUsers(userDept);
  }, [fetchCoordinators, fetchDeptUsers, userDept]);

  // Coordinator Form Actions
  const handleOpenCreateCoord = () => {
    setEditingCoordId(null);
    setCoordName('');
    setCoordEmail('');
    setCoordRole('STUDENT_COORDINATOR');
    setCoordRegNum('');
    setCoordPassword('');
    setCoordFormError(null);
    setShowCoordForm(true);
  };

  const handleOpenEditCoord = (coord: any) => {
    setEditingCoordId(coord.userId);
    setCoordName(coord.name);
    setCoordEmail(coord.email);
    setCoordRole(coord.role);
    setCoordRegNum(coord.registrationNumber || '');
    setCoordPassword('');
    setCoordFormError(null);
    setShowCoordForm(true);
  };

  const handleCoordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoordFormError(null);

    // Validate role limit on creation
    if (!editingCoordId) {
      const existingCoordsOfRole = coordinators.filter(c => c.role === coordRole);
      if (existingCoordsOfRole.length >= 3) {
        const roleLabel = coordRole === 'STUDENT_COORDINATOR' ? 'Student Coordinators' : 'Faculty Coordinators';
        setCoordFormError(`Maximum limit of 3 ${roleLabel} has been reached for ${userDept}.`);
        return;
      }
    }

    try {
      if (editingCoordId) {
        await updateCoordinator(editingCoordId, {
          name: coordName,
          email: coordEmail,
          role: coordRole,
          registrationNumber: coordRegNum,
          password: coordPassword || undefined
        });
      } else {
        await createCoordinator({
          name: coordName,
          email: coordEmail,
          department: userDept,
          role: coordRole,
          registrationNumber: coordRegNum,
          password: coordPassword || 'password123'
        });
      }
      setShowCoordForm(false);
      fetchCoordinators(userDept);
    } catch (err: any) {
      setCoordFormError(err.message || 'Operation failed');
    }
  };

  const handleDeleteCoord = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to remove Coordinator "${name}"?`)) {
      try {
        await deleteCoordinator(userId);
        fetchCoordinators(userDept);
      } catch (err: any) {
        alert(err.message || 'Failed to remove coordinator');
      }
    }
  };

  // User Form Actions
  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserEmail('');
    setUserRole('STUDENT');
    setUserRegNum('');
    setUserPassword('');
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleOpenEditUser = (u: any) => {
    setEditingUserId(u.userId);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserRegNum(u.registrationNumber || '');
    setUserPassword('');
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    try {
      if (editingUserId) {
        await updateDeptUser(editingUserId, {
          name: userName,
          email: userEmail,
          role: userRole,
          registrationNumber: userRegNum,
          password: userPassword || undefined
        });
      } else {
        await createDeptUser({
          name: userName,
          email: userEmail,
          department: userDept,
          role: userRole,
          registrationNumber: userRegNum,
          password: userPassword || 'password123'
        });
      }
      setShowUserForm(false);
      fetchDeptUsers(userDept);
    } catch (err: any) {
      setUserFormError(err.message || 'Operation failed');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await deleteDeptUser(userId);
        fetchDeptUsers(userDept);
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = '';
  };

  // Compute remaining coordinator slots
  const studentCoordsCount = coordinators.filter(c => c.role === 'STUDENT_COORDINATOR').length;
  const facultyCoordsCount = coordinators.filter(c => c.role === 'FACULTY_COORDINATOR').length;

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
              SPOC Portal
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', backgroundColor: 'rgba(168, 0, 0, 0.1)', color: 'var(--accent)', borderRadius: '100px' }}>
                {userDept} Dept
              </span>
            </h1>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('coordinators')} 
            className={`btn ${activeTab === 'coordinators' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <ShieldAlert size={16} />
            Coordinators
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Users size={16} />
            Students & Faculty
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'Department SPOC'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {authError && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            {authError}
          </div>
        )}

        {/* Tab 1: Coordinator CRUD */}
        {activeTab === 'coordinators' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Event Coordinators ({userDept})</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  Deploy and manage coordinators. Limits: <strong>{studentCoordsCount}/3</strong> Student Coordinators, <strong>{facultyCoordsCount}/3</strong> Faculty Coordinators.
                </p>
              </div>
              <button onClick={handleOpenCreateCoord} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={16} />
                Deploy Coordinator
              </button>
            </div>

            {/* Coordinator Form Modal */}
            {showCoordForm && (
              <div className="form-card animate-fade-in" style={{ marginBottom: '2rem', maxWidth: '600px', border: '1px solid var(--accent)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                  {editingCoordId ? 'Edit Coordinator details' : 'Register New Coordinator'}
                </h3>
                {coordFormError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    {coordFormError}
                  </div>
                )}
                <form onSubmit={handleCoordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={coordName} 
                        onChange={(e) => setCoordName(e.target.value)} 
                        placeholder="Vijay Chandran" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Coordinator Role Type</label>
                      <select 
                        className="form-input" 
                        value={coordRole} 
                        onChange={(e) => setCoordRole(e.target.value as any)}
                      >
                        <option value="STUDENT_COORDINATOR">Student Coordinator</option>
                        <option value="FACULTY_COORDINATOR">Faculty Coordinator</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Registration / Faculty ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={coordRegNum} 
                        onChange={(e) => setCoordRegNum(e.target.value)} 
                        placeholder="PEC-100234" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={coordEmail} 
                        onChange={(e) => setCoordEmail(e.target.value)} 
                        placeholder="vijay@pec.edu" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password {editingCoordId && '(Leave blank to keep same)'}</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={coordPassword} 
                      onChange={(e) => setCoordPassword(e.target.value)} 
                      placeholder={editingCoordId ? '••••••••' : 'password123'} 
                      required={!editingCoordId} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowCoordForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                      {editingCoordId ? 'Update Details' : 'Deploy Coordinator'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Coordinators Grid */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {coordinators.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No event coordinators deployed yet. Click "Deploy Coordinator" to provision one.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>ID Number</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Coordinator Type</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinators.map((coord) => (
                        <tr key={coord.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{coord.name}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              <Hash size={14} />
                              {coord.registrationNumber}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{coord.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              backgroundColor: coord.role === 'FACULTY_COORDINATOR' ? 'rgba(168, 0, 0, 0.1)' : 'rgba(0, 100, 200, 0.1)', 
                              color: coord.role === 'FACULTY_COORDINATOR' ? 'var(--accent)' : '#0064c8', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontWeight: 700, 
                              fontSize: '0.75rem' 
                            }}>
                              {coord.role === 'FACULTY_COORDINATOR' ? 'Faculty' : 'Student'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleOpenEditCoord(coord)} 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCoord(coord.userId, coord.name)} 
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

        {/* Tab 2: Students & Faculty */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Students & Faculty List ({userDept})</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Provision new department participants with register numbers and password keys</p>
              </div>
              <button onClick={handleOpenCreateUser} className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} />
                Add User
              </button>
            </div>

            {/* General User Form Modal */}
            {showUserForm && (
              <div className="form-card animate-fade-in" style={{ marginBottom: '2rem', maxWidth: '600px', border: '1px solid var(--accent)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 700 }}>
                  {editingUserId ? 'Edit User Credentials' : 'Add New Department Participant'}
                </h3>
                {userFormError && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    {userFormError}
                  </div>
                )}
                <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        placeholder="Nirmal Raj" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Role</label>
                      <select 
                        className="form-input" 
                        value={userRole} 
                        onChange={(e) => setUserRole(e.target.value as any)}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Register Number / ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={userRegNum} 
                        onChange={(e) => setUserRegNum(e.target.value)} 
                        placeholder="PEC-100445" 
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={userEmail} 
                        onChange={(e) => setUserEmail(e.target.value)} 
                        placeholder="nirmal@pec.edu" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access Password {editingUserId && '(Leave blank to keep same)'}</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={userPassword} 
                      onChange={(e) => setUserPassword(e.target.value)} 
                      placeholder={editingUserId ? '••••••••' : 'password123'} 
                      required={!editingUserId} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => setShowUserForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                      {editingUserId ? 'Update User' : 'Register User'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {deptUsers.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div>No department participants registered yet. Click "Add User" to provision one.</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Register Number</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Access Type</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptUsers.map((u) => (
                        <tr key={u.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              <Hash size={14} />
                              {u.registrationNumber}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              backgroundColor: u.role === 'FACULTY' ? 'rgba(168, 0, 0, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                              color: u.role === 'FACULTY' ? 'var(--accent)' : '#10b981', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontWeight: 700, 
                              fontSize: '0.75rem' 
                            }}>
                              {u.role === 'FACULTY' ? 'Faculty' : 'Student'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleOpenEditUser(u)} 
                                className="btn btn-secondary" 
                                style={{ width: 'auto', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.userId, u.name)} 
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
      </main>
    </div>
  );
};
