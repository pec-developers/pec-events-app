import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { AdminLogin } from './pages/AdminLogin';
import { SpocLogin } from './pages/SpocLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { SpocDashboard } from './pages/SpocDashboard';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Loading state
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

  // Get default redirect route for authenticated user
  const getDefaultRedirect = () => {
    if (!isAuthenticated || !user) return '/login';
    const role = user.role.toUpperCase();
    if (role === 'ADMIN') return '/admin';
    if (role === 'SPOC') return '/spoc';
    if (role === 'STUDENT_COORDINATOR' || role === 'FACULTY_COORDINATOR') return '/coordinator';
    return '/student';
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Public Only routes */}
      <Route path="/login" element={
        <PublicOnlyRoute>
          <Login onSuccess={() => {}} onNavigateToForgotPassword={() => {}} />
        </PublicOnlyRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicOnlyRoute>
          <ForgotPassword onNavigateToLogin={() => {}} />
        </PublicOnlyRoute>
      } />
      <Route path="/admin/login" element={
        <PublicOnlyRoute>
          <AdminLogin onSuccess={() => {}} />
        </PublicOnlyRoute>
      } />
      <Route path="/spoc/login" element={
        <PublicOnlyRoute>
          <SpocLogin onSuccess={() => {}} />
        </PublicOnlyRoute>
      } />

      {/* Protected Dashboards */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/spoc" element={
        <ProtectedRoute allowedRoles={['SPOC']}>
          <SpocDashboard />
        </ProtectedRoute>
      } />
      <Route path="/coordinator" element={
        <ProtectedRoute allowedRoles={['STUDENT_COORDINATOR', 'FACULTY_COORDINATOR']}>
          <CoordinatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
