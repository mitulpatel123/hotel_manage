import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PinScreen from './pages/PinScreen';
import ViewDashboard from './pages/ViewDashboard';
import ViewRoomIssues from './pages/ViewRoomIssues';
import StaffRoomIssues from './pages/StaffRoomIssues';
import UserManagement from './pages/UserManagement';
import LogBook from './pages/LogBook';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#013c80',
              color: '#fff',
              padding: '12px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(1, 60, 128, 0.15)',
              fontSize: '14px',
              maxWidth: '260px',
            },
            success: {
              style: {
                background: '#013c80',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#013c80',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#dc2626',
              },
            },
            duration: 2000,
            className: 'toast-compact',
          }}
        />
        <div className="flex-1">
          <Routes>
            {/* Public route - PIN entry */}
            <Route path="/" element={<PinScreen />} />

            {/* Login route - requires PIN */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requirePin={true} requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />

            {/* Protected routes requiring login */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requirePin={true} requireAuth={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requirePin={true} requireAuth={true} requireAdmin={true}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logbook"
              element={
                <ProtectedRoute requirePin={true} requireAuth={true} requireAdmin={true}>
                  <LogBook />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rooms/:roomId/issues"
              element={
                <ProtectedRoute requirePin={true} requireAuth={true}>
                  <StaffRoomIssues />
                </ProtectedRoute>
              }
            />

            {/* View-only routes requiring PIN */}
            <Route
              path="/view/dashboard"
              element={
                <ProtectedRoute requirePin={true} requireAuth={false}>
                  <ViewDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view/rooms/:roomId/issues"
              element={
                <ProtectedRoute requirePin={true} requireAuth={false}>
                  <ViewRoomIssues />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
