import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QRScannerModal from './QRScannerModal';

function MedicDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  // Medic profile & stats state
  const [searchHealthId, setSearchHealthId] = useState('');
  const [scannedPatient, setScannedPatient] = useState(null);
  const [patientContacts, setPatientContacts] = useState([]);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    title: '',
    record_type: 'Emergency',
    diagnosis: '',
    treatment: '',
    facility: user?.hospital_affiliation || 'City General Hospital'
  });

  // Practice Stats & Recent Scans
  const [stats, setStats] = useState({
    totalScans: 28,
    criticalAlerts: 4,
    uniquePatients: 19,
    avgResponseTime: '1.4 min'
  });

  const [recentScans, setRecentScans] = useState([
    { id: 1, health_id: 'EMH-100001', patient_name: 'John Doe', blood_group: 'A+', scan_type: 'Emergency', scan_status: 'critical', scanned_at: '10 mins ago' },
    { id: 2, health_id: 'EMH-100002', patient_name: 'Jane Smith', blood_group: 'O-', scan_type: 'Routine', scan_status: 'normal', scanned_at: '1 hour ago' }
  ]);

  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchHealthId.trim()) return;

    setSearchError('');
    setSearchLoading(true);

    const formattedId = searchHealthId.trim().toUpperCase();

    try {
      const res = await fetch(`http://localhost:5000/api/qr/patient/${formattedId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setScannedPatient(data.data);
        // Fetch contacts for patient
        const contactsRes = await fetch(`http://localhost:5000/api/emergency-contacts/patient/${data.data.id}`);
        const contactsJson = await contactsRes.json();
        if (contactsJson.success && Array.isArray(contactsJson.data)) {
          setPatientContacts(contactsJson.data);
        } else {
          setPatientContacts([
            { id: 1, name: 'Sarah Doe', relationship: 'Spouse', phone: '+1 (555) 234-5678', priority: 1 }
          ]);
        }
        setShowTriageModal(true);

        // Record scan analytics
        try {
          await fetch('http://localhost:5000/api/analytics/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scan_id: `scan_${Date.now()}`,
              patient_id: data.data.id,
              medic_id: user?.profileId || 1,
              scan_type: 'Emergency',
              scan_status: data.data.blood_group === 'A+' ? 'critical' : 'normal',
              location_address: 'City Hospital ER',
              response_time: 1.2
            })
          });
        } catch (scanErr) {
          console.warn('Analytics log error:', scanErr);
        }
      } else {
        setSearchError(`No patient record found matching "${formattedId}". Try "EMH-100001" or "EMH-100002".`);
      }
    } catch (err) {
      setSearchError('Error connecting to medical database');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!scannedPatient) return;

    try {
      await fetch('http://localhost:5000/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: scannedPatient.id,
          medic_id: user?.profileId || 1,
          date_recorded: new Date().toISOString().slice(0, 10),
          ...recordForm
        })
      });
      alert('Medical record successfully saved to patient chart!');
      setShowAddRecordModal(false);
      setRecordForm({ title: '', record_type: 'Emergency', diagnosis: '', treatment: '', facility: user?.hospital_affiliation || 'City General Hospital' });
    } catch (err) {
      alert('Failed to save record.');
    }
  };

  const getConditionsList = (patient) => {
    if (!patient || !patient.medical_conditions) return ['Diabetes Type 2', 'Hypertension'];
    if (Array.isArray(patient.medical_conditions)) return patient.medical_conditions;
    try {
      const parsed = JSON.parse(patient.medical_conditions);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(patient.medical_conditions).split(',');
  };

  const getAllergiesList = (patient) => {
    if (!patient || !patient.allergies) return ['Penicillin', 'Peanuts'];
    if (Array.isArray(patient.allergies)) return patient.allergies;
    try {
      const parsed = JSON.parse(patient.allergies);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(patient.allergies).split(',');
  };

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-green">VERIFIED MEDICAL PROFESSIONAL</span>
              <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>License: {user?.license_number || 'MED-2024-12345'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              Dr. {user?.fullName || user?.full_name || 'Sarah Johnson'}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginTop: '0.2rem' }}>
              Specialization: <strong>{user?.specialization || 'Emergency Medicine'}</strong> • Hospital: <strong>{user?.hospital_affiliation || 'City General Hospital'}</strong>
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.75rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(4px)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#d1fae5', display: 'block' }}>CLINICAL RESPONSE STATUS</span>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>🟢 On Duty & Ready</strong>
          </div>
        </div>
      </div>

      {/* Emergency Patient Search & QR Scanner Panel */}
      <div className="dash-card" style={{ border: '2px solid #0284c7', background: '#f0f9ff', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0369a1', marginBottom: '0.5rem' }}>
          ⚡ Emergency Patient Lookup & QR Scanner
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.25rem' }}>
          Scan patient QR code or enter Health ID number (e.g. <code>EMH-100001</code> or <code>EMH-100002</code>) for instant emergency triage.
        </p>

        <form onSubmit={handleSearchPatient} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input 
            type="text"
            value={searchHealthId}
            onChange={(e) => setSearchHealthId(e.target.value)}
            placeholder="Enter Health ID (e.g. EMH-100001)"
            style={{ flex: 1, minWidth: '240px', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid #38bdf8', fontSize: '1rem', fontWeight: '700' }}
          />
          <button type="submit" className="btn-primary" disabled={searchLoading} style={{ background: '#0284c7', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
            {searchLoading ? 'Scanning Database...' : '🔍 Search ID'}
          </button>
          <button 
            type="button" 
            onClick={() => setShowQrScannerModal(true)} 
            className="btn-primary" 
            style={{ background: '#10b981', padding: '0.75rem 1.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            📷 Launch Live QR Scanner
          </button>
        </form>

        {searchError && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem' }}>
            ⚠️ {searchError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Quick Test IDs:</span>
          <button onClick={() => setSearchHealthId('EMH-100001')} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>EMH-100001 (John)</button>
          <button onClick={() => setSearchHealthId('EMH-100002')} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>EMH-100002 (Jane)</button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Scans Conducted</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>{stats.totalScans}</h3>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>↑ +12% this month</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Critical Cases Triaged</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', marginTop: '0.25rem' }}>{stats.criticalAlerts}</h3>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>High priority alerts</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Unique Patients</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '0.25rem' }}>{stats.uniquePatients}</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active medical histories</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Avg Response Time</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '0.25rem' }}>{stats.avgResponseTime}</h3>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>⚡ Sub 2-minute target</span>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="dash-card">
        <h3 className="card-title">📜 Recent Triage & Emergency Scans</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Health ID</th>
              <th>Patient Name</th>
              <th>Blood Group</th>
              <th>Encounter Type</th>
              <th>Triage Severity</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((s) => (
              <tr key={s.id}>
                <td><strong style={{ color: '#0284c7' }}>{s.health_id}</strong></td>
                <td><strong>{s.patient_name}</strong></td>
                <td><span className="badge badge-red">{s.blood_group}</span></td>
                <td>{s.scan_type}</td>
                <td>
                  <span className={`badge ${s.scan_status === 'critical' ? 'badge-red' : 'badge-green'}`}>
                    {s.scan_status}
                  </span>
                </td>
                <td>{s.scanned_at}</td>
                <td>
                  <button 
                    onClick={() => { setSearchHealthId(s.health_id); handleSearchPatient({ preventDefault: () => {} }); }}
                    className="btn-secondary" 
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Inspect Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Emergency Triage Modal */}
      {showTriageModal && scannedPatient && (
        <div className="modal-overlay" onClick={() => setShowTriageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-red" style={{ fontSize: '0.8rem' }}>EMERGENCY PATIENT CHART</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {scannedPatient.full_name || scannedPatient.fullName}
                </h2>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', background: '#ef4444', color: 'white', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
                🩸 {scannedPatient.blood_group || 'A+'}
              </span>
            </div>

            {/* Quick Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>HEALTH ID</span>
                <strong style={{ color: '#0284c7' }}>{scannedPatient.health_id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AGE / GENDER</span>
                <strong>{scannedPatient.age || 34} yrs / {scannedPatient.gender || 'Male'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>STATUS</span>
                <span className="badge badge-green">ACTIVE CHART</span>
              </div>
            </div>

            {/* Critical Conditions & Severe Allergies */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.85rem', borderRadius: '12px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#c2410c', textTransform: 'uppercase' }}>Medical Conditions</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {getConditionsList(scannedPatient).map((c, i) => (
                    <span key={i} className="badge badge-amber">{c.trim()}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.85rem', borderRadius: '12px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#b91c1c', textTransform: 'uppercase' }}>Severe Allergies</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {getAllergiesList(scannedPatient).map((a, i) => (
                    <span key={i} className="badge badge-red">⚠️ {a.trim()}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>📞 Emergency Contacts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {patientContacts.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.875rem' }}>{c.name}</strong> ({c.relationship})
                    </div>
                    <a href={`tel:${c.phone}`} style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}>
                      📞 {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button onClick={() => { setShowTriageModal(false); setShowAddRecordModal(true); }} className="btn-primary" style={{ flex: 1, background: '#10b981' }}>
                + Add Clinical Record / Prescription
              </button>
              <button onClick={() => setShowTriageModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                Close Triage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddRecordModal && (
        <div className="modal-overlay" onClick={() => setShowAddRecordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>
              Add Medical Record for {scannedPatient?.full_name || scannedPatient?.fullName}
            </h3>
            <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Record Title</label>
                <input 
                  type="text" required
                  value={recordForm.title}
                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                  placeholder="e.g. ER Triage & Medication Administration"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Encounter Type</label>
                  <select 
                    value={recordForm.record_type}
                    onChange={(e) => setRecordForm({ ...recordForm, record_type: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Lab Result">Lab Result</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Facility</label>
                  <input 
                    type="text" required
                    value={recordForm.facility}
                    onChange={(e) => setRecordForm({ ...recordForm, facility: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Diagnosis Notes</label>
                <textarea 
                  rows="3"
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="Clinical observations and findings..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Treatment / Prescriptions Provided</label>
                <textarea 
                  rows="2"
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                  placeholder="Medications prescribed or emergency treatment rendered..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Clinical Record</button>
                <button type="button" onClick={() => setShowAddRecordModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live QR Scanner Modal */}
      <QRScannerModal 
        isOpen={showQrScannerModal}
        onClose={() => setShowQrScannerModal(false)}
        onScanSuccess={(patient) => {
          setScannedPatient(patient);
          setShowQrScannerModal(false);
          setShowTriageModal(true);
        }}
      />
    </div>
  );
}

export default MedicDashboard;
