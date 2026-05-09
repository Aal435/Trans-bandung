import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { connectSocket } from './services/socket';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { RoutesPage } from './pages/RoutesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      connectSocket();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routes"
        element={
          <ProtectedRoute>
            <RoutesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
