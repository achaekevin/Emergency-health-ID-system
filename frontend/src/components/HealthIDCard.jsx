import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function HealthIDCard({ patient }) {
  const [showModal, setShowModal] = useState(false);

  if (!patient) return null;

  const healthId = patient.health_id || 'EMH-100001';
  const baseUrl = window.location.origin;
  const qrValue = `${baseUrl}/emergency/${healthId}`;

  return (
    <>
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
              OFFICIAL EMERGENCY HEALTH ID
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#ffffff' }}>
              {patient.full_name || patient.fullName || 'Patient Name'}
            </h2>
          </div>
          <span style={{ background: '#ef4444', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
            🩸 {patient.blood_group || patient.bloodGroup || 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '0.6rem', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
            <QRCodeSVG value={qrValue} size={110} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>HEALTH ID NUMBER</span>
              <strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em', color: '#38bdf8' }}>{healthId}</strong>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>AGE</span>
                <span style={{ fontWeight: '700' }}>{patient.age || '34'} yrs</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>GENDER</span>
                <span style={{ fontWeight: '700' }}>{patient.gender || 'Male'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn-primary" 
            style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="3" height="3"/>
              <rect x="14" y="7" width="3" height="3"/>
              <rect x="7" y="14" width="3" height="3"/>
            </svg>
            Expand Emergency QR Card
          </button>
        </div>
      </div>

      {/* Emergency Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textTransform: 'none', background: '#0f172a', color: 'white', border: '2px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#38bdf8' }}>Emergency Medical ID</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1rem' }}>
                <QRCodeSVG value={qrValue} size={200} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>{patient.full_name || patient.fullName}</h2>
              <p style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.05em' }}>{healthId}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>BLOOD GROUP</span>
                <strong style={{ color: '#ef4444', fontSize: '1.1rem' }}>{patient.blood_group || patient.bloodGroup || 'A+'}</strong>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>AGE & GENDER</span>
                <strong>{patient.age || '34'} yrs / {patient.gender || 'Male'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => window.print()}
                className="btn-primary" 
                style={{ flex: 1, background: '#10b981' }}
              >
                🖨️ Print / Save ID Card
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="btn-secondary" 
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HealthIDCard;
