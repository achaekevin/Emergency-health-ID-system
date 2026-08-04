import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function WelcomeSetup() {
  const { user } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome to Emergency Health ID System</h1>
      <p>Hi {user?.fullName || user?.email}!</p>
      <p>Let's set up your profile to get started.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => navigate(user?.role === 'patient' ? '/patient/dashboard' : '/medic/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default WelcomeSetup;
