import { useSelector } from 'react-redux';

function PatientDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Patient Dashboard</h1>
      <p>Welcome, {user?.fullName || user?.email}!</p>
      <p>This is your patient dashboard. Feature implementation in progress.</p>
    </div>
  );
}

export default PatientDashboard;
