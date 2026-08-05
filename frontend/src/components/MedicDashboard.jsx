import { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import QRScannerModal from './QRScannerModal';
import UserProfileManager from './UserProfileManager';
import MedicalTimeline from './MedicalTimeline';
import DocumentRepository from './DocumentRepository';
import AppointmentModule from './AppointmentModule';
import { checkDrugInteractions } from '../utils/drugInteractionChecker';



function MedicDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  // Active tab state
  const [activeTab, setActiveTab] = useState('home');

  // Scanner & Patient Search State
  const [searchHealthId, setSearchHealthId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showQrScannerModal, setShowQrScannerModal] = useState(false);

  // Active Patient Emergency Triage Data
  const [activePatient, setActivePatient] = useState({
    id: 101,
    health_id: 'EMH-100001',
    national_id: 'ID-987654321',
    full_name: 'John Doe',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    dob: '1990-05-14',
    age: 36,
    gender: 'Male',
    blood_group: 'O-',
    weight: '74 kg',
    height: '178 cm',
    organ_donor: 'Registered Donor',
    insurance: 'Aetna Global Health — Policy POL-992104-X',
    allergies: [
      { id: 1, name: 'Penicillin', severity: 'Critical (Anaphylaxis)', notes: 'Causes severe respiratory distress' },
      { id: 2, name: 'Peanuts', severity: 'High', notes: 'EpiPen required' }
    ],
    chronic_conditions: ['Diabetes Type 2', 'Hypertension'],
    current_medications: [
      { id: 1, medication_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', purpose: 'Blood sugar' },
      { id: 2, medication_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', purpose: 'Blood pressure' }
    ],
    emergency_contacts: [
      { id: 1, name: 'Sarah Doe', relationship: 'Spouse', phone: '+1 (555) 234-5678', priority: 1 },
      { id: 2, name: 'Robert Doe', relationship: 'Brother', phone: '+1 (555) 876-5432', priority: 2 }
    ],
    medical_alerts: '⚠️ High Anaphylaxis Risk. Diabetic protocol active.'
  });

  // Clinical Encounters & Prescriptions State
  const [encounters, setEncounters] = useState([
    { id: 1, date: '2026-08-04', symptoms: 'Severe dizziness, elevated blood pressure (160/100)', diagnosis: 'Acute Hypertensive Episode', notes: 'Administered sublingual antihypertensive in ER.', treatment: 'Stabilization & monitoring', procedures: 'ECG, Blood Panel', follow_up: 'Follow up in 48 hours' }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { id: 1, medication_name: 'Lisinopril', dosage: '10mg', frequency: 'Once Daily', duration: '30 Days', status: 'Active' },
    { id: 2, medication_name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', duration: 'Continuous', status: 'Active' }
  ]);

  const [recentScans, setRecentScans] = useState([]);
  const [medicProfile, setMedicProfile] = useState(null);
  const [patientList, setPatientList] = useState([]);

  useEffect(() => {
    fetchMedicDashboardData();
  }, [user]);

  const fetchMedicDashboardData = async () => {
    try {
      const authId = user?.auth_id || user?.authId || 'auth_medic_001';

      // 1. Fetch Medic Profile
      const mRes = await fetch(`http://localhost:5000/api/medics/auth/${authId}`);
      const mData = await mRes.json();
      if (mData.success && mData.data) {
        setMedicProfile(mData.data);
      }

      // 2. Fetch Patients List & Active Patient Data
      const pRes = await fetch('http://localhost:5000/api/patients');
      const pData = await pRes.json();
      if (pData.success && Array.isArray(pData.data) && pData.data.length > 0) {
        setPatientList(pData.data);
        const p = pData.data[0];
        setActivePatient(prev => ({
          ...prev,
          id: p.id,
          health_id: p.health_id || 'EMH-100001',
          full_name: p.full_name || 'John Doe',
          dob: p.date_of_birth ? p.date_of_birth.slice(0, 10) : '1990-05-14',
          blood_group: p.blood_group || 'O-',
          allergies: p.allergies ? (Array.isArray(p.allergies) ? p.allergies : JSON.parse(p.allergies)) : prev.allergies,
          chronic_conditions: p.medical_conditions ? (Array.isArray(p.medical_conditions) ? p.medical_conditions : JSON.parse(p.medical_conditions)) : prev.chronic_conditions
        }));

        setRecentScans([
          { id: 1, health_id: p.health_id || 'EMH-100001', patient_name: p.full_name || 'John Doe', blood_group: p.blood_group || 'O-', scan_type: 'Emergency Triage', scan_status: 'Critical Alert', time: 'Just now' }
        ]);
      }

      // 3. Fetch Encounters
      const rRes = await fetch(`http://localhost:5000/api/records/patient/${activePatient.id || 1}`);
      const rData = await rRes.json();
      if (rData.success && Array.isArray(rData.data) && rData.data.length > 0) {
        setEncounters(rData.data.map(r => ({
          id: r.id,
          date: r.record_date ? r.record_date.slice(0, 10) : '2026-08-04',
          symptoms: r.symptoms || 'Presented for clinical evaluation',
          diagnosis: r.diagnosis || 'Clinical Diagnosis',
          notes: r.clinical_notes || 'Patient evaluated by ER medic.',
          treatment: r.treatment || 'Standard clinical management',
          procedures: r.procedures || 'Vitals Check, ECG',
          follow_up: r.follow_up || 'As needed'
        })));
      }
    } catch (err) {
      console.warn('Real medic data load notice:', err);
    }
  };



  // Form states
  const [encounterForm, setEncounterForm] = useState({ symptoms: '', diagnosis: '', notes: '', treatment: '', procedures: '', follow_up: '' });
  const [prescriptionForm, setPrescriptionForm] = useState({ medication_name: '', dosage: '', frequency: '', duration: '' });

  // Handlers
  const handleSearchPatient = (e) => {
    e.preventDefault();
    if (!searchHealthId.trim()) return;
    setSearchError('');
    alert(`Fetched Patient Triage data for ${searchHealthId.toUpperCase()}`);
    setActiveTab('triage');
  };

  const handleCreateEncounter = (e) => {
    e.preventDefault();
    setEncounters([{ id: Date.now(), date: new Date().toISOString().slice(0, 10), ...encounterForm }, ...encounters]);
    setEncounterForm({ symptoms: '', diagnosis: '', notes: '', treatment: '', procedures: '', follow_up: '' });
    alert('Clinical Encounter recorded successfully to patient chart!');
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();
    const warnings = checkDrugInteractions(prescriptionForm.medication_name, prescriptions, activePatient.allergies || []);
    
    if (warnings.length > 0) {
      const warningMsg = warnings.map(w => `${w.title}\n${w.details}`).join('\n\n');
      const proceed = window.confirm(`⚠️ CLINICAL DECISION SUPPORT WARNING:\n\n${warningMsg}\n\nDo you want to override this warning and proceed?`);
      if (!proceed) return;
    }

    setPrescriptions([{ id: Date.now(), ...prescriptionForm, status: 'Active' }, ...prescriptions]);
    setPrescriptionForm({ medication_name: '', dosage: '', frequency: '', duration: '' });
    alert('Prescription issued successfully!');
  };


  const handleStopPrescription = (id) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: 'Stopped' } : p));
  };

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-medic" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>VERIFIED MEDICAL PROFESSIONAL</span>
              <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>License: {user?.license_number || 'MED-2024-12345'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Dr. {user?.fullName || user?.full_name || 'Sarah Johnson'}</h1>
            <p style={{ color: '#d1fae5', fontSize: '0.9rem' }}>Emergency Triage, QR Scan Verification, Clinical Encounters & Prescriptions</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d1fae5' }}>Hospital Affiliation</span>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.2rem 0' }}>City General Hospital ER</div>
            <span style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Duty Status: Active On-Call</span>
          </div>
        </div>
      </div>

      {/* Navigation Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-section-title">Emergency Core</div>
          <button className={`sidebar-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            🏠 Dashboard Home
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => setActiveTab('scanner')}>
            📷 Emergency Scanner
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'triage' ? 'active' : ''}`} onClick={() => setActiveTab('triage')}>
            🚨 Emergency Patient View
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'patient_search' ? 'active' : ''}`} onClick={() => setActiveTab('patient_search')}>
            🔍 Patient Search
          </button>

          <div className="sidebar-section-title">Clinical Actions</div>
          <button className={`sidebar-nav-btn ${activeTab === 'encounters' ? 'active' : ''}`} onClick={() => setActiveTab('encounters')}>
            ✍️ Clinical Encounters
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
            💊 Prescription Management
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'medical_history' ? 'active' : ''}`} onClick={() => setActiveTab('medical_history')}>
            📜 Patient Medical History
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'emergency_actions' ? 'active' : ''}`} onClick={() => setActiveTab('emergency_actions')}>
            ⚡ Emergency Actions
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            📈 Patient Timeline
          </button>

          <div className="sidebar-section-title">Doctor Workspace</div>
          <button className={`sidebar-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 Clinical Analytics
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            🔔 Notifications
          </button>

          <button className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-main-content">

          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-4">
                <div className="dash-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TOTAL PATIENTS TREATED</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>142</div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+12 this week</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #0284c7' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TODAY'S QR SCANS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>18</div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>100% verified</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>CRITICAL PATIENTS TODAY</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444', margin: '0.2rem 0' }}>3</div>
                  <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Severe Allergies</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>AVG RESPONSE TIME</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>1.4 min</div>
                  <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Top 5% ER speed</span>
                </div>
              </div>

              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Recent Emergency Scans</h3>
                  <button onClick={() => setActiveTab('scanner')} className="btn-primary" style={{ fontSize: '0.8rem' }}>📷 Launch Scanner</button>
                </div>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Health ID</th>
                      <th>Patient Name</th>
                      <th>Blood Group</th>
                      <th>Scan Type</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.health_id}</strong></td>
                        <td>{s.patient_name}</td>
                        <td><span className="badge badge-red">{s.blood_group}</span></td>
                        <td>{s.scan_type}</td>
                        <td><span className={s.scan_status.includes('Critical') ? 'badge badge-red' : 'badge badge-green'}>{s.scan_status}</span></td>
                        <td>{s.time}</td>
                        <td>
                          <button onClick={() => setActiveTab('triage')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>View Triage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: EMERGENCY SCANNER */}
          {activeTab === 'scanner' && (
            <div className="dash-card">
              <h3 className="card-title">📷 Emergency QR & Barcode Scanner</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                  <h4>Camera QR Code Scanner</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>Scan physical emergency health card or mobile QR screen.</p>
                  <button onClick={() => setShowQrScannerModal(true)} className="btn-primary">Activate Live Camera</button>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                  <h4>Upload QR Code Image</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>Select a saved PNG/JPEG image containing a Health ID QR code.</p>
                  <input type="file" accept="image/*" onChange={() => { alert('QR Code parsed successfully! Loading patient data...'); setActiveTab('triage'); }} style={{ fontSize: '0.85rem' }} />
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h4>Manual Health ID Lookup</h4>
                <form onSubmit={handleSearchPatient} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input type="text" placeholder="Enter Health ID (e.g. EMH-100001)" value={searchHealthId} onChange={(e) => setSearchHealthId(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <button type="submit" className="btn-primary">Search Database</button>
                </form>
                {searchError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{searchError}</p>}
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY PATIENT VIEW (TRIAGE) */}
          {activeTab === 'triage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Critical Alert Bar */}
              <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '1rem 1.25rem', borderRadius: '14px', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>🚨 CRITICAL EMERGENCY PATIENT TRIAGE</strong>
                  <p style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>{activePatient.medical_alerts}</p>
                </div>
                <button onClick={() => setActiveTab('encounters')} className="btn-danger">✍️ Create Encounter</button>
              </div>

              <div className="grid-3">
                {/* Patient Photo & Info Card */}
                <div className="dash-card">
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontWeight: '800' }}>
                      JD
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{activePatient.full_name}</h3>
                    <span className="badge badge-patient">{activePatient.health_id}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <div><strong>National ID:</strong> {activePatient.national_id}</div>
                    <div><strong>DOB / Age:</strong> {activePatient.dob} ({activePatient.age} yrs)</div>
                    <div><strong>Gender:</strong> {activePatient.gender}</div>
                    <div><strong>Blood Group:</strong> <span className="badge badge-red">{activePatient.blood_group}</span></div>
                    <div><strong>Weight / Height:</strong> {activePatient.weight} / {activePatient.height}</div>
                    <div><strong>Organ Donor:</strong> {activePatient.organ_donor}</div>
                  </div>
                </div>

                {/* Severe Allergies & Conditions */}
                <div className="dash-card">
                  <h3 className="card-title">⚠️ Severe Allergies & Conditions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activePatient.allergies.map(a => (
                      <div key={a.id} style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase' }}>{a.severity}</span>
                        <p style={{ fontWeight: '800', color: '#7f1d1d', marginTop: '0.1rem' }}>{a.name}</p>
                        <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>{a.notes}</span>
                      </div>
                    ))}
                    <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>Chronic Diseases</span>
                      <p style={{ fontWeight: '800', color: '#78350f', marginTop: '0.1rem' }}>{activePatient.chronic_conditions.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts & Insurance */}
                <div className="dash-card">
                  <h3 className="card-title">📞 Emergency Contacts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activePatient.emergency_contacts.map(c => (
                      <div key={c.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong>{c.name}</strong> ({c.relationship})
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.phone}</span>
                          <a href={`tel:${c.phone}`} className="btn-success" style={{ textDecoration: 'none', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>📞 Call</a>
                        </div>
                      </div>
                    ))}
                    <div style={{ background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bae6fd', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0369a1' }}>INSURANCE POLICY</span>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0c4a6e', marginTop: '0.1rem' }}>{activePatient.insurance}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PATIENT SEARCH */}
          {activeTab === 'patient_search' && (
            <div className="dash-card">
              <h3 className="card-title">🔍 Search Patient Records Database</h3>
              <form onSubmit={handleSearchPatient} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input type="text" placeholder="Search by Health ID, National ID, or Full Name..." value={searchHealthId} onChange={(e) => setSearchHealthId(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <select style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option>All Facilities</option>
                  <option>City General ER</option>
                  <option>St. Jude Hospital</option>
                </select>
                <button type="submit" className="btn-primary">Search Database</button>
              </form>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Health ID</th>
                    <th>Full Name</th>
                    <th>National ID</th>
                    <th>Blood Group</th>
                    <th>Primary Condition</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>EMH-100001</strong></td>
                    <td>John Doe</td>
                    <td>ID-987654321</td>
                    <td><span className="badge badge-red">O-</span></td>
                    <td>Diabetes Type 2</td>
                    <td><button onClick={() => setActiveTab('triage')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Open Triage</button></td>
                  </tr>

                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: CLINICAL ENCOUNTERS */}
          {activeTab === 'encounters' && (
            <div className="dash-card">
              <h3 className="card-title">✍️ Record New Clinical Encounter</h3>
              <form onSubmit={handleCreateEncounter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Patient</label>
                  <input type="text" readOnly value={`${activePatient.full_name} (${activePatient.health_id})`} style={{ width: '100%', padding: '0.6rem', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Presented Symptoms</label>
                  <textarea required value={encounterForm.symptoms} onChange={(e) => setEncounterForm({ ...encounterForm, symptoms: e.target.value })} placeholder="e.g. Acute chest pain, shortness of breath..." style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Clinical Diagnosis</label>
                  <textarea required value={encounterForm.diagnosis} onChange={(e) => setEncounterForm({ ...encounterForm, diagnosis: e.target.value })} placeholder="e.g. Acute Hypertensive Crisis..." style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '70px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Treatment Provided</label>
                  <input type="text" required value={encounterForm.treatment} onChange={(e) => setEncounterForm({ ...encounterForm, treatment: e.target.value })} placeholder="e.g. Oxygen administration, IV Sublingual" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Procedures Performed</label>
                  <input type="text" value={encounterForm.procedures} onChange={(e) => setEncounterForm({ ...encounterForm, procedures: e.target.value })} placeholder="e.g. 12-lead ECG, Troponin Blood Test" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Follow-up Instructions</label>
                  <input type="text" value={encounterForm.follow_up} onChange={(e) => setEncounterForm({ ...encounterForm, follow_up: e.target.value })} placeholder="e.g. Return to ER if symptoms recur in 24 hours" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button type="submit" className="btn-primary">💾 Save Encounter to Patient Chart</button>
                </div>
              </form>

              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>Previous Clinical Encounters</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {encounters.map(e => (
                  <div key={e.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ color: '#0f172a' }}>{e.diagnosis}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{e.date}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Symptoms:</strong> {e.symptoms}</p>
                    <p style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Treatment:</strong> {e.treatment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PRESCRIPTION MANAGEMENT */}
          {activeTab === 'prescriptions' && (
            <div className="dash-card">
              <h3 className="card-title">💊 Issue & Manage Prescriptions</h3>
              <form onSubmit={handleAddPrescription} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                <input type="text" placeholder="Medication Name" required value={prescriptionForm.medication_name} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication_name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Dosage (e.g. 500mg)" required value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Frequency" required value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="text" placeholder="Duration (e.g. 14 Days)" required value={prescriptionForm.duration} onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <div style={{ gridColumn: 'span 4' }}>
                  <button type="submit" className="btn-primary">➕ Issue Prescription</button>
                </div>
              </form>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medication Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.medication_name}</strong></td>
                      <td>{p.dosage}</td>
                      <td>{p.frequency}</td>
                      <td>{p.duration}</td>
                      <td><span className={p.status === 'Active' ? 'badge badge-green' : 'badge badge-red'}>{p.status}</span></td>
                      <td>
                        {p.status === 'Active' && (
                          <button onClick={() => handleStopPrescription(p.id)} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Stop Medication</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: PATIENT MEDICAL HISTORY */}
          {activeTab === 'medical_history' && (
            <div className="dash-card">
              <h3 className="card-title">📜 Patient Complete Diagnostic History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Annual Comprehensive Blood Panel</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>2026-06-14</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>HbA1c: 6.8% (Controlled Diabetic Range). Kidney & Liver functions within normal limits.</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>12-Lead Electrocardiogram (ECG)</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>2026-07-20</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>Normal sinus rhythm. No acute ischemic changes detected.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: EMERGENCY ACTIONS */}
          {activeTab === 'emergency_actions' && (
            <div className="dash-card">
              <h3 className="card-title">⚡ Quick Emergency Triage Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => alert('Dialing primary emergency contact: Sarah Doe (+1 555 234-5678)...')} className="btn-danger" style={{ padding: '1.25rem', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>📞</span> Call Primary Emergency Contact
                </button>
                <button onClick={() => window.print()} className="btn-primary" style={{ padding: '1.25rem', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>🖨️</span> Print Emergency Triage Summary
                </button>
                <button onClick={() => alert('Downloading ER Encounter PDF...')} className="btn-secondary" style={{ padding: '1.25rem', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>📥</span> Export Encounter Summary PDF
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: TIMELINE */}
          {activeTab === 'timeline' && (
            <MedicalTimeline />
          )}


          {/* TAB 10: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="dash-card">
              <h3 className="card-title">📊 Doctor Practice & Response Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>EMERGENCY SCANS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>128</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>DIAGNOSES RECORDED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>94</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PRESCRIPTIONS ISSUED</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>112</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PROFESSIONAL PROFILE & CREDENTIALS */}
          {activeTab === 'profile' && (
            <UserProfileManager 
              onSaveSuccess={() => {
                setActiveTab('home');
              }} 
            />
          )}



          {/* TAB 12: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="dash-card">
              <h3 className="card-title">🔔 Medical Alerts & License Notifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '10px' }}>
                  <span className="badge badge-red">CRITICAL CASE</span>
                  <p style={{ fontWeight: '700', color: '#991b1b', marginTop: '0.2rem' }}>New ER arrival with Severe Anaphylaxis alert (Patient EMH-100001).</p>
                </div>
                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '10px' }}>
                  <span className="badge badge-patient">SYSTEM</span>
                  <p style={{ fontWeight: '700', color: '#0369a1', marginTop: '0.2rem' }}>Medical License verification renewed successfully through Dec 2027.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dash-card">
              <h3 className="card-title">⚙️ Doctor Dashboard Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Automatic QR Triage Opening</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Audible Beep on Scan Success</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* QR SCANNER MODAL */}
      {showQrScannerModal && (
        <QRScannerModal 
          onClose={() => setShowQrScannerModal(false)}
          onScanSuccess={(patientData) => {
            setActivePatient(patientData);
            setShowQrScannerModal(false);
            setActiveTab('triage');
          }}
        />
      )}
    </div>
  );
}

export default MedicDashboard;
