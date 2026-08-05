import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import HealthIDCard from './HealthIDCard';
import UserProfileManager from './UserProfileManager';
import MedicalTimeline from './MedicalTimeline';
import DocumentRepository from './DocumentRepository';
import AppointmentModule from './AppointmentModule';



function PatientDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  // Active tab state
  const [activeTab, setActiveTab] = useState('home');
  const [medInfoSubTab, setMedInfoSubTab] = useState('allergies');

  // Patient state
  const [patientData, setPatientData] = useState({
    id: user?.profileId || user?.id || 1,
    full_name: user?.fullName || user?.full_name || 'John Doe',
    email: user?.email || 'patient@edhis.com',
    health_id: user?.healthId || 'EMH-100001',
    national_id: user?.national_id || 'ID-987654321',
    dob: user?.dob || '1990-05-14',
    gender: user?.gender || 'Male',
    blood_group: user?.blood_group || 'A+',
    weight: user?.weight || '74 kg',
    height: user?.height || '178 cm',
    organ_donor: user?.organ_donor || 'Yes (Registered)',
    insurance_provider: user?.insurance_provider || 'Aetna Health Care',
    insurance_policy: user?.insurance_policy || 'POL-992104-X',
    allergies: user?.allergies || [
      { id: 1, name: 'Penicillin', severity: 'High', notes: 'Causes severe anaphylactic rash' },
      { id: 2, name: 'Peanuts', severity: 'Critical', notes: 'Carries EpiPen everywhere' }
    ],
    medical_conditions: user?.medical_conditions || [
      { id: 1, condition: 'Diabetes Type 2', category: 'Chronic', notes: 'Controlled via Metformin' },
      { id: 2, condition: 'Hypertension', category: 'Chronic', notes: 'Monitored daily' }
    ],
    surgeries: ['Appendectomy (2018)', 'Knee Arthroscopy (2021)'],
    disabilities: 'None',
    pregnancy_status: 'N/A',
    family_history: 'Hypertension (Father), Type 2 Diabetes (Mother)',
    lifestyle: {
      smoking: 'Non-Smoker',
      alcohol: 'Occasional (Social)',
      exercise: '3 times / week (Moderate)'
    }
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [medicationLogs, setMedicationLogs] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchRealPatientData();
    }
  }, [user]);

  const fetchRealPatientData = async () => {
    try {
      const patientId = user?.profileId || user?.id || 1;
      const authId = user?.auth_id || user?.authId || 'auth_patient_001';

      // 1. Fetch Patient Info
      const pRes = await fetch(`http://localhost:5000/api/patients/auth/${authId}`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        const p = pData.data;
        setPatientData(prev => ({
          ...prev,
          id: p.id || prev.id,
          full_name: p.full_name || user?.fullName || prev.full_name,
          health_id: p.health_id || user?.healthId || prev.health_id,
          dob: p.date_of_birth ? p.date_of_birth.slice(0, 10) : (p.dob || prev.dob),
          gender: p.gender || prev.gender,
          blood_group: p.blood_group || prev.blood_group,
          allergies: p.allergies ? (Array.isArray(p.allergies) ? p.allergies : JSON.parse(p.allergies)) : prev.allergies,
          medical_conditions: p.medical_conditions ? (Array.isArray(p.medical_conditions) ? p.medical_conditions : JSON.parse(p.medical_conditions)) : prev.medical_conditions,
        }));
      }

      // 2. Fetch Emergency Contacts
      const cRes = await fetch(`http://localhost:5000/api/emergency-contacts/patient/${patientId}`);
      const cData = await cRes.json();
      if (cData.success && Array.isArray(cData.data)) {
        setEmergencyContacts(cData.data);
      }

      // 3. Fetch Medication Logs
      const mRes = await fetch(`http://localhost:5000/api/medication-log/patient/${patientId}`);
      const mData = await mRes.json();
      if (mData.success && Array.isArray(mData.data)) {
        setMedicationLogs(mData.data);
      }

      // 4. Fetch Medical Records / History
      const rRes = await fetch(`http://localhost:5000/api/records/patient/${patientId}`);
      const rData = await rRes.json();
      if (rData.success && Array.isArray(rData.data)) {
        setMedicalHistory(rData.data.map(r => ({
          id: r.id,
          date: r.record_date ? r.record_date.slice(0, 10) : '2026-08-01',
          doctor: r.attending_medic || 'Dr. Medical Professional',
          facility: r.hospital_name || 'City General Hospital',
          type: 'Clinical Encounter',
          diagnosis: r.diagnosis || 'Clinical Diagnosis',
          prescription: r.prescription || 'Prescribed Therapy',
          notes: r.clinical_notes || r.symptoms || 'Encounters recorded to chart.'
        })));
      }
    } catch (err) {
      console.warn('Real patient data fetch notice:', err);
    }
  };


  const [documents, setDocuments] = useState([
    { id: 1, title: 'Prescription_Metformin_2026.pdf', category: 'Prescription', uploaded_at: '2026-06-15', size: '240 KB' },
    { id: 2, title: 'Blood_Panel_Lab_Report.pdf', category: 'Lab Report', uploaded_at: '2026-06-14', size: '1.2 MB' },
    { id: 3, title: 'Insurance_Card_Aetna.pdf', category: 'Insurance', uploaded_at: '2026-01-05', size: '450 KB' }
  ]);

  const [accessHistory] = useState([
    { id: 1, medic_name: 'Dr. Sarah Johnson', hospital: 'City General Hospital', date: '2026-07-20', time: '14:22 EST', reason: 'Emergency ER Triage Scan' },
    { id: 2, medic_name: 'Dr. Marcus Vance', hospital: 'St. Jude ER', date: '2026-06-15', time: '09:15 EST', reason: 'Routine Outpatient Consultation' }
  ]);

  const [notifications] = useState([
    { id: 1, type: 'Medication', message: 'Time to take Metformin 500mg', time: '10 mins ago', unread: true },
    { id: 2, type: 'Security', message: 'Your Health ID QR was scanned by Dr. Sarah Johnson', time: '2 hours ago', unread: false },
    { id: 3, type: 'Appointment', message: 'Upcoming Endocrinology follow-up tomorrow at 10:00 AM', time: '1 day ago', unread: false }
  ]);

  // Form & Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  // Forms
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'Moderate', notes: '' });
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', priority: 1, is_primary: false });
  const [newMed, setNewMed] = useState({ medication_name: '', dosage: '', frequency: '', start_date: '', end_date: '', reminder: true });
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Lab Report' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Handlers
  const handleAddAllergy = (e) => {
    e.preventDefault();
    const updated = [...patientData.allergies, { id: Date.now(), ...newAllergy }];
    setPatientData({ ...patientData, allergies: updated });
    setNewAllergy({ name: '', severity: 'Moderate', notes: '' });
    setShowAddAllergyModal(false);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    setEmergencyContacts([...emergencyContacts, { id: Date.now(), ...newContact }]);
    setNewContact({ name: '', relationship: '', phone: '', priority: 1, is_primary: false });
    setShowAddContactModal(false);
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    setMedicationLogs([...medicationLogs, { id: Date.now(), ...newMed, status: 'active' }]);
    setNewMed({ medication_name: '', dosage: '', frequency: '', start_date: '', end_date: '', reminder: true });
    setShowAddMedModal(false);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    setDocuments([...documents, { id: Date.now(), title: newDoc.title || 'Uploaded_Document.pdf', category: newDoc.category, uploaded_at: new Date().toISOString().slice(0, 10), size: '320 KB' }]);
    setNewDoc({ title: '', category: 'Lab Report' });
    setShowDocUploadModal(false);
  };

  const handleRegenerateQR = () => {
    alert('QR Code successfully regenerated and security token updated!');
  };

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-patient" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>PATIENT PORTAL</span>
              <span style={{ fontSize: '0.8rem', color: '#bae6fd' }}>Health ID: {patientData.health_id}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Welcome, {patientData.full_name}</h1>
            <p style={{ color: '#e0f2fe', fontSize: '0.9rem' }}>Manage your emergency digital health card, personal vitals, medications & records</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e0f2fe' }}>Profile Completion</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.2rem 0' }}>85%</div>
            <span style={{ fontSize: '0.75rem', color: '#bae6fd' }}>Vitals & Contacts Active</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Navigation Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-section-title">Navigation</div>
          
          <button className={`sidebar-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            🏠 Dashboard Home
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'my_health_id' ? 'active' : ''}`} onClick={() => setActiveTab('my_health_id')}>
            🪪 My Health ID
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'medical_info' ? 'active' : ''}`} onClick={() => setActiveTab('medical_info')}>
            🩺 Medical Information
          </button>

          <button className={`sidebar-nav-btn ${activeTab === 'medical_history' ? 'active' : ''}`} onClick={() => setActiveTab('medical_history')}>
            📋 Medical History (Read Only)
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            📈 Care Pathway Timeline
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            📅 Appointments & Follow-ups
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'consent' ? 'active' : ''}`} onClick={() => setActiveTab('consent')}>
            🔐 Consent Management
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            📁 Documents & Scans
          </button>

          <button className={`sidebar-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            🔔 Notifications
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'access_history' ? 'active' : ''}`} onClick={() => setActiveTab('access_history')}>
            👁️ Access History
          </button>
          
          <div className="sidebar-section-title">Security & Account</div>
          <button className={`sidebar-nav-btn ${activeTab === 'privacy_security' ? 'active' : ''}`} onClick={() => setActiveTab('privacy_security')}>
            🛡️ Privacy & Security
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            ⚙️ Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-main-content">

          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-3">
                <div style={{ gridColumn: 'span 2' }}>
                  <HealthIDCard patient={patientData} />
                </div>
                <div className="dash-card">
                  <h3 className="card-title">🚨 Emergency Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ background: '#fee2e2', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase' }}>Severe Allergies</span>
                      <p style={{ fontWeight: '700', color: '#7f1d1d', marginTop: '0.15rem' }}>Penicillin, Peanuts (Severe)</p>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>Chronic Conditions</span>
                      <p style={{ fontWeight: '700', color: '#78350f', marginTop: '0.15rem' }}>Diabetes Type 2, Hypertension</p>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Primary Emergency Contact</span>
                      <p style={{ fontWeight: '700', color: '#14532d', marginTop: '0.15rem' }}>Sarah Doe (Spouse) — +1 (555) 234-5678</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>⏰ Medication Reminders</h3>
                    <button onClick={() => setActiveTab('medical_info')} className="btn-secondary" style={{ fontSize: '0.75rem' }}>View All</button>
                  </div>
                  {medicationLogs.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                      <div>
                        <strong>{m.medication_name}</strong> ({m.dosage})
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.frequency}</div>
                      </div>
                      <span className="badge badge-green">Active</span>
                    </div>
                  ))}
                </div>

                <div className="dash-card">
                  <h3 className="card-title">📅 Upcoming Appointments</h3>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Endocrinology Follow-up</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dr. Sarah Johnson • Tomorrow at 10:00 AM</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Cardiology Routine Check</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>City Hospital • Aug 24, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY HEALTH ID */}
          {activeTab === 'my_health_id' && (
            <div className="dash-card">
              <h3 className="card-title">🪪 Official Digital Health ID & QR</h3>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <HealthIDCard patient={patientData} />
                </div>
                <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Health ID Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <button onClick={() => window.print()} className="btn-primary">🖨️ Print Health ID Card</button>
                      <button onClick={() => alert('Downloading Health ID PDF Summary...')} className="btn-secondary">📥 Download PDF Card</button>
                      <button onClick={handleRegenerateQR} className="btn-secondary">🔄 Regenerate QR Code Token</button>
                      <button onClick={() => setShowShareModal(true)} className="btn-secondary">🔗 Share QR Code Securely</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL PROFILE & CREDENTIALS */}
          {activeTab === 'profile' && (
            <UserProfileManager 
              onSaveSuccess={(updated) => {
                if (updated) {
                  setPatientData(prev => ({
                    ...prev,
                    full_name: updated.fullName || updated.full_name || prev.full_name,
                    dob: updated.dob || prev.dob,
                    gender: updated.gender || prev.gender,
                    blood_group: updated.bloodGroup || updated.blood_group || prev.blood_group
                  }));
                }
                setActiveTab('home');
              }} 
            />
          )}



          {/* TAB 4: MEDICAL INFORMATION */}
          {activeTab === 'medical_info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="sub-nav-bar">
                <button className={`sub-nav-pill ${medInfoSubTab === 'allergies' ? 'active' : ''}`} onClick={() => setMedInfoSubTab('allergies')}>Allergies</button>
                <button className={`sub-nav-pill ${medInfoSubTab === 'conditions' ? 'active' : ''}`} onClick={() => setMedInfoSubTab('conditions')}>Medical Conditions</button>
                <button className={`sub-nav-pill ${medInfoSubTab === 'lifestyle' ? 'active' : ''}`} onClick={() => setMedInfoSubTab('lifestyle')}>Lifestyle</button>
                <button className={`sub-nav-pill ${medInfoSubTab === 'medications' ? 'active' : ''}`} onClick={() => setMedInfoSubTab('medications')}>Current Medications</button>
                <button className={`sub-nav-pill ${medInfoSubTab === 'contacts' ? 'active' : ''}`} onClick={() => setMedInfoSubTab('contacts')}>Emergency Contacts</button>
              </div>

              {/* Sub tab: Allergies */}
              {medInfoSubTab === 'allergies' && (
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>⚠️ Allergies Management</h3>
                    <button onClick={() => setShowAddAllergyModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Add Allergy</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {patientData.allergies.map(a => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{a.name}</strong>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{a.notes}</p>
                        </div>
                        <span className={`badge ${a.severity === 'Critical' || a.severity === 'High' ? 'badge-red' : 'badge-amber'}`}>{a.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub tab: Conditions */}
              {medInfoSubTab === 'conditions' && (
                <div className="dash-card">
                  <h3 className="card-title">🩺 Chronic Diseases & Surgeries</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>CHRONIC CONDITIONS</h4>
                      {patientData.medical_conditions.map(c => (
                        <div key={c.id} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                          <strong>{c.condition}</strong> — <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.notes}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>PREVIOUS SURGERIES</h4>
                      <p style={{ fontSize: '0.9rem', color: '#1e293b' }}>{patientData.surgeries.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub tab: Lifestyle */}
              {medInfoSubTab === 'lifestyle' && (
                <div className="dash-card">
                  <h3 className="card-title">🌿 Lifestyle Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>SMOKING</span>
                      <p style={{ fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>{patientData.lifestyle.smoking}</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>ALCOHOL</span>
                      <p style={{ fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>{patientData.lifestyle.alcohol}</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>EXERCISE</span>
                      <p style={{ fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>{patientData.lifestyle.exercise}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub tab: Medications */}
              {medInfoSubTab === 'medications' && (
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>💊 Current Medications</h3>
                    <button onClick={() => setShowAddMedModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Add Medication</button>
                  </div>
                  {medicationLogs.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{m.medication_name}</strong> ({m.dosage})
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Frequency: {m.frequency} • Start: {m.start_date}</p>
                      </div>
                      <span className="badge badge-green">Active</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub tab: Emergency Contacts */}
              {medInfoSubTab === 'contacts' && (
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>🚨 Emergency Contacts</h3>
                    <button onClick={() => setShowAddContactModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Add Contact</button>
                  </div>
                  {emergencyContacts.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{c.name}</strong> ({c.relationship})
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📞 {c.phone}</p>
                      </div>
                      <span className={`badge ${c.is_primary ? 'badge-red' : 'badge-patient'}`}>{c.is_primary ? 'Primary Contact' : 'Secondary'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MEDICAL HISTORY (READ ONLY) */}
          {activeTab === 'medical_history' && (
            <div className="dash-card">
              <h3 className="card-title">📋 Clinical Medical History (Read Only)</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Note: Diagnostic records and prescriptions added by medical professionals are read-only to preserve clinical accuracy and legal compliance.
              </p>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attending Doctor</th>
                    <th>Facility</th>
                    <th>Diagnosis</th>
                    <th>Prescription</th>
                    <th>Clinical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.map(h => (
                    <tr key={h.id}>
                      <td>{h.date}</td>
                      <td><strong>{h.doctor}</strong></td>
                      <td>{h.facility}</td>
                      <td><span className="badge badge-amber">{h.diagnosis}</span></td>
                      <td>{h.prescription}</td>
                      <td>{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: MEDICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <MedicalTimeline />
          )}

          {/* TAB: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <AppointmentModule />
          )}

          {/* TAB: CONSENT MANAGEMENT */}
          {activeTab === 'consent' && (
            <div className="dash-card">
              <h3 className="card-title">🔐 Patient Consent & Access Permissions Management</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Grant, restrict, or temporarily authorize medical access to your digital health record.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Default Access Scope</h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ fontSize: '0.8rem' }}>✔ All Licensed Medical Professionals</button>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>Emergency Triage Only</button>
                    <button className="btn-secondary" style={{ fontSize: '0.8rem' }}>Whitelisted Hospitals Only</button>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#166534' }}>⏱️ Temporary 24-Hour Access Token</strong>
                    <p style={{ fontSize: '0.8rem', color: '#15803d', margin: 0 }}>Active until tomorrow 09:30 AM EST</p>
                  </div>
                  <button onClick={() => alert('Temporary token revoked immediately!')} className="btn-danger">Revoke Access Now</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTS & SCANS */}
          {activeTab === 'documents' && (
            <DocumentRepository />
          )}


          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="dash-card">
              <h3 className="card-title">🔔 System & Emergency Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: n.unread ? '#f0f9ff' : '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <div>
                      <span className={`badge ${n.type === 'Medication' ? 'badge-green' : (n.type === 'Security' ? 'badge-red' : 'badge-patient')}`}>{n.type}</span>
                      <p style={{ fontWeight: '600', marginTop: '0.3rem', color: '#0f172a' }}>{n.message}</p>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ACCESS HISTORY */}
          {activeTab === 'access_history' && (
            <div className="dash-card">
              <h3 className="card-title">👁️ Audit Log of Who Viewed Your Records</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Medical Professional</th>
                    <th>Hospital / Facility</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Access Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {accessHistory.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.medic_name}</strong></td>
                      <td>{a.hospital}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td><span className="badge badge-amber">{a.reason}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 9: PRIVACY & SECURITY */}
          {activeTab === 'privacy_security' && (
            <div className="dash-card">
              <h3 className="card-title">🛡️ Privacy & Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <form onSubmit={(e) => { e.preventDefault(); alert('Password updated successfully!'); }} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Change Password</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <input type="password" placeholder="Current Password" required value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="password" placeholder="New Password" required value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <input type="password" placeholder="Confirm New Password" required value={passwordForm.confirmPass} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Update Password</button>
                </form>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Two-Factor Authentication (2FA)</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Require an SMS/Authenticator OTP code on every login attempt.</p>
                  </div>
                  <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={twoFactorEnabled ? 'btn-danger' : 'btn-success'}>
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="dash-card">
              <h3 className="card-title">⚙️ Application Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Theme Preference</span>
                  <select style={{ padding: '0.5rem', borderRadius: '8px' }}>
                    <option>System Light Mode</option>
                    <option>Dark Mode</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Language</span>
                  <select style={{ padding: '0.5rem', borderRadius: '8px' }}>
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div style={{ paddingTop: '1rem' }}>
                  <button onClick={() => alert('Account deletion request submitted to system administrators.')} className="btn-danger">
                    ⚠️ Request Account Deletion
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {showAddAllergyModal && (
        <div className="modal-overlay" onClick={() => setShowAddAllergyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Allergy Record</h3>
            <form onSubmit={handleAddAllergy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Allergy Name (e.g. Latex, Aspirin)" required value={newAllergy.name} onChange={(e) => setNewAllergy({ ...newAllergy, name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <select value={newAllergy.severity} onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical (Anaphylactic)</option>
              </select>
              <textarea placeholder="Clinical notes or reaction symptoms..." value={newAllergy.notes} onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Allergy</button>
                <button type="button" onClick={() => setShowAddAllergyModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Emergency Contact</h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Contact Full Name" required value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Relationship (Spouse, Sibling, Parent)" required value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="tel" placeholder="Phone Number" required value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={newContact.is_primary} onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })} />
                Set as Primary Emergency Contact
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
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
            <h3>Add Medication Log</h3>
            <form onSubmit={handleAddMedication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Medication Name" required value={newMed.medication_name} onChange={(e) => setNewMed({ ...newMed, medication_name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Dosage (e.g. 500mg)" required value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Frequency (e.g. Twice Daily)" required value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Medication</button>
                <button type="button" onClick={() => setShowAddMedModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocUploadModal && (
        <div className="modal-overlay" onClick={() => setShowDocUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Health Document</h3>
            <form onSubmit={handleAddDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Document Title / Filename" required value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <select value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Insurance">Insurance Document</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
              <input type="file" required style={{ padding: '0.6rem', background: '#f8fafc', borderRadius: '8px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Upload Document</button>
                <button type="button" onClick={() => setShowDocUploadModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🔗 Securely Share Emergency Health ID</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>Generate a temporary encrypted link or QR code to allow emergency access for 24 hours.</p>
            <input type="text" readOnly value={`https://edhis.health/emergency/access?token=${patientData.health_id}`} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9' }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => { navigator.clipboard?.writeText(`https://edhis.health/emergency/access?token=${patientData.health_id}`); alert('Link copied to clipboard!'); }} className="btn-primary" style={{ flex: 1 }}>Copy Share Link</button>
              <button onClick={() => setShowShareModal(false)} className="btn-secondary" style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
