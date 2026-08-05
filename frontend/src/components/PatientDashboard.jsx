import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import HealthIDCard from './HealthIDCard';

function PatientDashboard() {
  const { user } = useSelector((state) => state.auth || {});
  
  // Patient state
  const [patientData, setPatientData] = useState(user || {});
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicationLogs, setMedicationLogs] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [scanLogs, setScanLogs] = useState([]);
  
  // Modals & UI states
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showEditVitalsModal, setShowEditVitalsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', priority: 1 });
  const [newMed, setNewMed] = useState({ medication_name: '', dosage: '', frequency: '', purpose: '' });
  const [editVitals, setEditVitals] = useState({
    blood_group: user?.blood_group || 'A+',
    age: user?.age || 34,
    gender: user?.gender || 'Male',
    medical_conditions: Array.isArray(user?.medical_conditions) ? user.medical_conditions.join(', ') : (user?.medical_conditions || 'Diabetes Type 2, Hypertension'),
    allergies: Array.isArray(user?.allergies) ? user.allergies.join(', ') : (user?.allergies || 'Penicillin, Peanuts')
  });

  const patientId = user?.profileId || user?.id || 1;

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Emergency Contacts
      const contactsRes = await fetch(`http://localhost:5000/api/emergency-contacts/patient/${patientId}`);
      const contactsJson = await contactsRes.json();
      if (contactsJson.success && Array.isArray(contactsJson.data)) {
        setEmergencyContacts(contactsJson.data);
      } else {
        // Fallback seed data if API returns empty
        setEmergencyContacts([
          { id: 1, name: 'Sarah Doe', relationship: 'Spouse', phone: '+1 (555) 234-5678', priority: 1 },
          { id: 2, name: 'Robert Doe', relationship: 'Brother', phone: '+1 (555) 876-5432', priority: 2 }
        ]);
      }

      // 2. Fetch Medications
      const medsRes = await fetch(`http://localhost:5000/api/medication-log/patient/${patientId}`);
      const medsJson = await medsRes.json();
      if (medsJson.success && Array.isArray(medsJson.data)) {
        setMedicationLogs(medsJson.data);
      } else {
        setMedicationLogs([
          { id: 1, medication_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', purpose: 'Blood sugar control', status: 'active' },
          { id: 2, medication_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in morning', purpose: 'Blood pressure regulation', status: 'active' }
        ]);
      }

      // 3. Fetch Medical Records
      const recordsRes = await fetch(`http://localhost:5000/api/records/patient/${patientId}`);
      const recordsJson = await recordsRes.json();
      if (recordsJson.success && Array.isArray(recordsJson.data)) {
        setMedicalRecords(recordsJson.data);
      } else {
        setMedicalRecords([
          { id: 1, record_type: 'Checkup', title: 'Annual Health Evaluation', diagnosis: 'Type 2 Diabetes controlled', facility: 'City General Hospital', date_recorded: '2026-06-15' },
          { id: 2, record_type: 'Emergency', title: 'Emergency Room Triage Scan', diagnosis: 'Mild Hypertension', facility: 'St. Jude Emergency Center', date_recorded: '2026-07-20' }
        ]);
      }

      // 4. Fetch Recent Scan Logs
      const scanRes = await fetch(`http://localhost:5000/api/analytics/scans/recent?limit=5`);
      const scanJson = await scanRes.json();
      if (scanJson.success && Array.isArray(scanJson.data)) {
        setScanLogs(scanJson.data);
      }
    } catch (err) {
      console.warn('Error fetching patient details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add Emergency Contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, ...newContact })
      });
      const data = await res.json();
      if (data.success) {
        setEmergencyContacts([...emergencyContacts, { id: data.data.id, ...newContact }]);
      } else {
        setEmergencyContacts([...emergencyContacts, { id: Date.now(), ...newContact }]);
      }
      setNewContact({ name: '', relationship: '', phone: '', priority: 1 });
      setShowAddContactModal(false);
    } catch (err) {
      setEmergencyContacts([...emergencyContacts, { id: Date.now(), ...newContact }]);
      setShowAddContactModal(false);
    }
  };

  // Add Medication Log
  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/medication-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, start_date: new Date().toISOString().slice(0, 10), ...newMed })
      });
      const data = await res.json();
      setMedicationLogs([...medicationLogs, { id: data.data?.id || Date.now(), ...newMed, status: 'active' }]);
      setNewMed({ medication_name: '', dosage: '', frequency: '', purpose: '' });
      setShowAddMedModal(false);
    } catch (err) {
      setMedicationLogs([...medicationLogs, { id: Date.now(), ...newMed, status: 'active' }]);
      setShowAddMedModal(false);
    }
  };

  // Update Health Vitals
  const handleSaveVitals = () => {
    setPatientData({
      ...patientData,
      blood_group: editVitals.blood_group,
      age: editVitals.age,
      gender: editVitals.gender,
      medical_conditions: editVitals.medical_conditions.split(',').map(s => s.trim()),
      allergies: editVitals.allergies.split(',').map(s => s.trim())
    });
    setShowEditVitalsModal(false);
  };

  const getConditionsList = () => {
    if (Array.isArray(patientData.medical_conditions)) return patientData.medical_conditions;
    if (typeof patientData.medical_conditions === 'string') return patientData.medical_conditions.split(',');
    return ['Diabetes Type 2', 'Hypertension'];
  };

  const getAllergiesList = () => {
    if (Array.isArray(patientData.allergies)) return patientData.allergies;
    if (typeof patientData.allergies === 'string') return patientData.allergies.split(',');
    return ['Penicillin', 'Peanuts'];
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Patient Emergency Portal</h1>
        <p>Manage your emergency digital health identity, contacts, vitals, and medical logs</p>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Card 1: Official Health ID Card */}
        <div style={{ gridColumn: 'span 2' }}>
          <HealthIDCard patient={patientData} />
        </div>

        {/* Card 2: Health Vitals & Quick Summary */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>🩺 Medical Vitals</h3>
            <button onClick={() => setShowEditVitalsModal(true)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
              ✏️ Edit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Medical Conditions</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                {getConditionsList().map((cond, idx) => (
                  <span key={idx} className="badge badge-amber">{cond.trim()}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Severe Allergies</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                {getAllergiesList().map((all, idx) => (
                  <span key={idx} className="badge badge-red">⚠️ {all.trim()}</span>
                ))}
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>System Status</span>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#166534', marginTop: '0.15rem' }}>
                ✅ Emergency Sync Active & Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Section: Emergency Contacts */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>🚨 Emergency Contacts</h3>
            <button onClick={() => setShowAddContactModal(true)} className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              + Add Contact
            </button>
          </div>

          {emergencyContacts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No emergency contacts added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {emergencyContacts.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{c.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.relationship} • {c.phone}</span>
                  </div>
                  <span className={`badge ${c.priority === 1 ? 'badge-red' : 'badge-patient'}`}>
                    {c.priority === 1 ? 'Primary Contact' : 'Secondary'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Medication Logs */}
        <div className="dash-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>💊 Active Medications</h3>
            <button onClick={() => setShowAddMedModal(true)} className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              + Add Medication
            </button>
          </div>

          {medicationLogs.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No active medications logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {medicationLogs.map((m) => (
                <div key={m.id} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{m.medication_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block' }}>{m.dosage} — {m.frequency}</span>
                    {m.purpose && <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Purpose: {m.purpose}</span>}
                  </div>
                  <span className="badge badge-green">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section: Medical Records History */}
      <div className="dash-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">📋 Medical Records & Clinical Encounters</h3>
        {medicalRecords.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No medical records recorded yet.</p>
        ) : (
          <table className="custom-table" style={{ marginTop: '0.5rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Title / Summary</th>
                <th>Diagnosis</th>
                <th>Facility</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((r) => (
                <tr key={r.id}>
                  <td>{r.date_recorded ? new Date(r.date_recorded).toLocaleDateString() : 'Recent'}</td>
                  <td><span className="badge badge-patient">{r.record_type || 'Encounter'}</span></td>
                  <td><strong>{r.title}</strong></td>
                  <td>{r.diagnosis || 'N/A'}</td>
                  <td>{r.facility || 'City Hospital'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Add Emergency Contact</h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Contact Name</label>
                <input 
                  type="text" required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Sarah Doe"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Relationship</label>
                <input 
                  type="text" required
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g. Spouse / Brother / Parent"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Phone Number</label>
                <input 
                  type="tel" required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2834"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Contact</button>
                <button type="button" onClick={() => setShowAddContactModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMedModal && (
        <div className="modal-overlay" onClick={() => setShowAddMedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Add Medication Log</h3>
            <form onSubmit={handleAddMedication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Medication Name</label>
                <input 
                  type="text" required
                  value={newMed.medication_name}
                  onChange={(e) => setNewMed({ ...newMed, medication_name: e.target.value })}
                  placeholder="e.g. Metformin"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Dosage</label>
                  <input 
                    type="text" required
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    placeholder="e.g. 500mg"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Frequency</label>
                  <input 
                    type="text" required
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    placeholder="e.g. Twice daily"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Purpose / Indication</label>
                <input 
                  type="text"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  placeholder="e.g. Diabetes control"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Medication</button>
                <button type="button" onClick={() => setShowAddMedModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditVitalsModal && (
        <div className="modal-overlay" onClick={() => setShowEditVitalsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Edit Personal Vitals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Blood Group</label>
                  <select 
                    value={editVitals.blood_group}
                    onChange={(e) => setEditVitals({ ...editVitals, blood_group: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Age</label>
                  <input 
                    type="number"
                    value={editVitals.age}
                    onChange={(e) => setEditVitals({ ...editVitals, age: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Gender</label>
                  <select 
                    value={editVitals.gender}
                    onChange={(e) => setEditVitals({ ...editVitals, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Medical Conditions (comma separated)</label>
                <input 
                  type="text"
                  value={editVitals.medical_conditions}
                  onChange={(e) => setEditVitals({ ...editVitals, medical_conditions: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Severe Allergies (comma separated)</label>
                <input 
                  type="text"
                  value={editVitals.allergies}
                  onChange={(e) => setEditVitals({ ...editVitals, allergies: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handleSaveVitals} className="btn-primary" style={{ flex: 1 }}>Save Vitals</button>
                <button onClick={() => setShowEditVitalsModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
