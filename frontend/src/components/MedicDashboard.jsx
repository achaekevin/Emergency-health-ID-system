import { useSelector } from 'react-redux';

function MedicDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Medic Dashboard</h1>
      <p>Welcome, Dr. {user?.fullName || user?.email}!</p>
      <p>This is your medic dashboard. Feature implementation in progress.</p>
    </div>
  );
}

export default MedicDashboard;
