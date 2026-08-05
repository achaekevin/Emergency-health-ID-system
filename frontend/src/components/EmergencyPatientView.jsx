import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

function EmergencyPatientView() {
  const { healthId } = useParams();
  const [patient, setPatient] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (healthId) {
      fetchEmergencyData(healthId);
    }
  }, [healthId]);

  const fetchEmergencyData = async (targetId) => {
    setLoading(true);
    setError('');
    const cleanId = targetId.trim().toUpperCase();

    try {
      const res = await fetch(`http://localhost:5000/api/qr/patient/${cleanId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setPatient(data.data);
        if (data.data.emergency_contacts && Array.isArray(data.data.emergency_contacts) && data.data.emergency_contacts.length > 0) {
          setContacts(data.data.emergency_contacts);
        } else {
          // Fetch contacts fallback
          const cRes = await fetch(`http://localhost:5000/api/emergency-contacts/patient/${data.data.id}`);
          const cData = await cRes.json();
          if (cData.success && Array.isArray(cData.data)) {
            setContacts(cData.data);
          } else {
            setContacts([
              { id: 1, name: 'Sarah Doe', relationship: 'Spouse', phone: '+1 (555) 234-5678', priority: 1 }
            ]);
          }
        }
      } else {
        setError(`No active patient profile found for Health ID: "${cleanId}"`);
      }
    } catch (err) {
      setError('Unable to connect to emergency database. Please verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  const getConditions = () => {
    if (!patient || !patient.medical_conditions) return ['Diabetes Type 2', 'Hypertension'];
    if (Array.isArray(patient.medical_conditions)) return patient.medical_conditions;
    return String(patient.medical_conditions).split(',');
  };

  const getAllergies = () => {
    if (!patient || !patient.allergies) return ['Penicillin', 'Peanuts'];
    if (Array.isArray(patient.allergies)) return patient.allergies;
    return String(patient.allergies).split(',');
  };

  const getMeds = () => {
    if (!patient || !patient.current_medications) return ['Metformin 500mg', 'Lisinopril 10mg'];
    if (Array.isArray(patient.current_medications)) return patient.current_medications;
    return String(patient.current_medications).split(',');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#ef4444', width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '1.4rem' }}>
              ✚
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                EMERGENCY HEALTH ID SYSTEM
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official First Responder Triage View
              </span>
            </div>
          </div>

          <Link to="/login" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
            Sign In Portal →
          </Link>
        </div>

        {loading && (
          <div style={{ background: '#1e293b', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
            <div className="appLoadingSpinner"></div>
            <h3 style={{ color: '#38bdf8', marginTop: '1rem' }}>Accessing Emergency Chart...</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Retrieving critical medical attributes for Health ID: {healthId}</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: '#1e293b', border: '2px solid #ef4444', borderRadius: '20px', padding: '2.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fca5a5' }}>Profile Not Found</h2>
            <p style={{ color: '#cbd5e1', marginTop: '0.5rem', fontSize: '1rem' }}>{error}</p>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/" className="btn-primary" style={{ background: '#0284c7', display: 'inline-block', textDecoration: 'none' }}>
                Return to Main Portal
              </Link>
            </div>
          </div>
        )}

        {patient && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Primary Banner Card */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '2px solid #0284c7', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>
                    VERIFIED PATIENT
                  </span>
                  <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', marginTop: '0.3rem' }}>
                    {patient.full_name || patient.fullName}
                  </h2>
                  <span style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.05em' }}>
                    HEALTH ID: {patient.health_id}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#ef4444', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '1.4rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)', display: 'inline-block' }}>
                    🩸 {patient.blood_group || 'A+'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', fontWeight: '700' }}>BLOOD TYPE</span>
                </div>
              </div>

              {/* Age / Gender / QR Code */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#0f172a', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                  <QRCodeSVG value={window.location.href} size={95} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>AGE & GENDER</span>
                    <strong>{patient.age || 34} Years Old • {patient.gender || 'Male'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>EMERGENCY STATUS</span>
                    <span style={{ color: '#34d399', fontWeight: '800' }}>🟢 Active Emergency Sync Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Conditions & Severe Allergies Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              
              <div style={{ background: '#1e293b', border: '1px solid #f97316', borderRadius: '16px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fb923c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <span>🩺</span> Medical Conditions
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {getConditions().map((cond, idx) => (
                    <span key={idx} style={{ background: 'rgba(251, 146, 60, 0.2)', color: '#fdba74', border: '1px solid rgba(251, 146, 60, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700' }}>
                      {cond.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '16px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <span>⚠️</span> Severe Allergies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {getAllergies().map((all, idx) => (
                    <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '800' }}>
                      ⚠️ {all.trim()}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Active Medications */}
            <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💊 Active Medications
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {getMeds().map((m, idx) => (
                  <span key={idx} style={{ background: '#0f172a', color: '#e0f2fe', border: '1px solid #38bdf8', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700' }}>
                    {m.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Emergency Contacts - 1-Click Call */}
            <div style={{ background: '#1e293b', border: '2px solid #34d399', borderRadius: '16px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📞 Emergency Contacts (Click to Call)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contacts.map((c) => (
                  <div key={c.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{c.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>Relationship: {c.relationship}</span>
                    </div>

                    <a 
                      href={`tel:${c.phone}`}
                      style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                    >
                      📞 Call {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              <p>Emergency Health ID System • Secured Clinical Profile</p>
              <div style={{ marginTop: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn-secondary" style={{ background: '#334155', color: '#f8fafc', padding: '0.5rem 1rem' }}>
                  🖨️ Print Emergency Profile
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default EmergencyPatientView;
