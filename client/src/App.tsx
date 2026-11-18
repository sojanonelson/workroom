import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProjectWorkspace } from './pages/AdminProjectWorkspace';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerProjectView } from './pages/CustomerProjectView';
import { InviteLanding } from './pages/InviteLanding';

// Protected Route wrapper with role check
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'admin' | 'customer' }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If admin is visiting customer route, permit it; but if customer visits admin route, redirect to portal
    if (allowedRole === 'admin' && role !== 'admin') {
      return <Navigate to="/portal" replace />;
    }
  }

  return <>{children}</>;
};

// Home router redirects based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/portal" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#090a0c] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public & Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/invite/:token" element={<InviteLanding />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/projects/:id"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminProjectWorkspace />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portal/projects/:id"
                element={
                  <ProtectedRoute>
                    <CustomerProjectView />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
