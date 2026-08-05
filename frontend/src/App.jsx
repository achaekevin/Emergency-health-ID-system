import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import PatientDashboard from './components/PatientDashboard';
import MedicDashboard from './components/MedicDashboard';
import AdminDashboard from './components/AdminDashboard';
import WelcomeSetup from './components/WelcomeSetup';
import QRScanner from './components/QRScanner';
import Documentation from './components/Documentation';
import OAuthCallback from './components/OAuthCallback';
import EmergencyPatientView from './components/EmergencyPatientView';

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  // Protected Route wrapper with Navbar header
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    );
  };

  return (
    <Routes>
      {/* Public Emergency Scan Route */}
      <Route path="/emergency/:healthId" element={<EmergencyPatientView />} />

      {/* Public Auth Routes */}
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

      {/* Default Root Redirect based on Role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'patient' && <PatientDashboard />}
            {user?.role === 'medic' && <MedicDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
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
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
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
