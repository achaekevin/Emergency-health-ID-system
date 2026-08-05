import { useState } from 'react';
import { useSelector } from 'react-redux';

function AppointmentModule() {
  const { user } = useSelector((state) => state.auth || {});
  const userRole = user?.role || 'patient';

  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Johnson', patient: 'John Doe', healthId: 'EMH-100001', facility: 'City General Hospital', department: 'Endocrinology', date: '2026-08-06', time: '10:00 AM', type: 'Follow-up Consultation', status: 'Scheduled', notes: 'Review blood glucose log & Metformin tolerance.' },
    { id: 2, doctor: 'Dr. Marcus Vance', patient: 'Jane Smith', healthId: 'EMH-100002', facility: 'St. Jude ER Clinic', department: 'Cardiology', date: '2026-08-12', time: '14:30 PM', type: 'Routine BP Check', status: 'Confirmed', notes: 'Check Lisinopril efficacy.' }
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    doctor: userRole === 'medic' ? `Dr. ${user?.fullName || 'Sarah Johnson'}` : 'Dr. Sarah Johnson',
    patient: 'John Doe',
    healthId: 'EMH-100001',
    facility: 'City General Hospital',
    department: 'Cardiology',
    date: '',
    time: '',
    type: 'Follow-up Consultation',
    notes: ''
  });

  const handleScheduleAppt = (e) => {
    e.preventDefault();
    setAppointments([
      { id: Date.now(), ...newAppt, status: 'Scheduled' },
      ...appointments
    ]);
    setShowScheduleModal(false);
    alert('Appointment successfully scheduled!');
  };

  const handleUpdateStatus = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    alert(`Appointment status updated to: ${newStatus}`);
  };

  return (
    <div className="dash-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>📅 Clinical Appointment & Follow-Up Module</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Schedule, confirm attendance, reschedule or cancel medical consultations</span>
        </div>
        <button onClick={() => setShowScheduleModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          + Schedule New Appointment
        </button>
      </div>

      <table className="custom-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>{userRole === 'patient' ? 'Attending Doctor' : 'Patient Name'}</th>
            <th>Facility / Department</th>
            <th>Appointment Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>
                <strong style={{ display: 'block', color: '#0f172a' }}>{a.date}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.time}</span>
              </td>
              <td>
                <strong>{userRole === 'patient' ? a.doctor : `${a.patient} (${a.healthId})`}</strong>
              </td>
              <td>{a.facility} • {a.department}</td>
              <td><span className="badge badge-patient">{a.type}</span></td>
              <td>
                <span className={`badge ${a.status === 'Confirmed' ? 'badge-green' : (a.status === 'Cancelled' ? 'badge-red' : 'badge-amber')}`}>
                  {a.status}
                </span>
              </td>
              <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {a.status !== 'Confirmed' && a.status !== 'Cancelled' && (
                  <button onClick={() => handleUpdateStatus(a.id, 'Confirmed')} className="btn-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                    Confirm
                  </button>
                )}
                {a.status !== 'Cancelled' && (
                  <button onClick={() => handleUpdateStatus(a.id, 'Cancelled')} className="btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Clinical Follow-Up Appointment</h3>
            <form onSubmit={handleScheduleAppt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Patient Name & ID</label>
                  <input type="text" required value={newAppt.patient} onChange={(e) => setNewAppt({ ...newAppt, patient: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Attending Doctor</label>
                  <input type="text" required value={newAppt.doctor} onChange={(e) => setNewAppt({ ...newAppt, doctor: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Date</label>
                  <input type="date" required value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Time</label>
                  <input type="time" required value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Clinical Notes / Reason</label>
                <textarea placeholder="Reason for follow-up appointment..." value={newAppt.notes} onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '60px' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Schedule Appointment</button>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentModule;
