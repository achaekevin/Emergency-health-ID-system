import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboard from './components/PatientDashboard';
import MedicDashboard from './components/MedicDashboard';
import WelcomeSetup from './components/WelcomeSetup';
import QRScanner from './components/QRScanner';
import Documentation from './components/Documentation';
import OAuthCallback from './components/OAuthCallback';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  // Protected Route wrapper
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        } 
      />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'patient' && <PatientDashboard />}
            {user?.role === 'medic' && <MedicDashboard />}
            {!user?.role && <Navigate to="/setup" replace />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <WelcomeSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medic/dashboard"
        element={
          <ProtectedRoute allowedRoles={['medic']}>
            <MedicDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/medic/scanner"
        element={
          <ProtectedRoute allowedRoles={['medic']}>
            <QRScanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documentation"
        element={
          <ProtectedRoute>
            <Documentation />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
