import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

function QRScanner({ onScanSuccess, inline = false }) {
  const [scanResult, setScanResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualHealthId, setManualHealthId] = useState('');
  
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && isScanningCamera) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setIsScanningCamera(false);
    }
  };

  const processQrText = async (decodedText) => {
    setErrorMsg('');
    setLoading(true);

    let healthId = decodedText ? decodedText.trim() : '';

    if (healthId.includes('/emergency/')) {
      const parts = healthId.split('/emergency/');
      healthId = parts[parts.length - 1];
    } else {
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.healthId) healthId = parsed.healthId;
      } catch (e) {}
    }

    healthId = healthId.split('?')[0].split('#')[0].trim().toUpperCase();
    setScanResult(healthId);

    try {
      const res = await fetch(`http://localhost:5000/api/qr/patient/${healthId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setPatientData(data.data);

        // Fetch contacts
        const contactsRes = await fetch(`http://localhost:5000/api/emergency-contacts/patient/${data.data.id}`);
        const contactsJson = await contactsRes.json();
        if (contactsJson.success && Array.isArray(contactsJson.data)) {
          setContacts(contactsJson.data);
        } else {
          setContacts([
            { id: 1, name: 'Sarah Doe', relationship: 'Spouse', phone: '+1 (555) 234-5678', priority: 1 }
          ]);
        }

        if (onScanSuccess) {
          onScanSuccess(data.data);
        }
      } else {
        setErrorMsg(`No patient found with Health ID: "${healthId}". Please check the QR code or try EMH-100001.`);
      }
    } catch (err) {
      setErrorMsg('Failed to query patient database.');
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanner = async () => {
    setErrorMsg('');
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = html5QrCode;
      setIsScanningCamera(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCameraScanner();
          processQrText(decodedText);
        },
        (errorMessage) => {
          // Frame scan warning (can ignore)
        }
      );
    } catch (err) {
      setErrorMsg('Camera access denied or camera not available. Try uploading a QR image file below.');
      setIsScanningCamera(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      processQrText(decodedText);
    } catch (err) {
      setErrorMsg('Could not detect a valid Emergency Health ID QR code in the uploaded image. Try entering the Health ID manually.');
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualHealthId.trim()) {
      processQrText(manualHealthId);
    }
  };

  const getConditionsList = (p) => {
    if (!p || !p.medical_conditions) return ['Diabetes Type 2', 'Hypertension'];
    if (Array.isArray(p.medical_conditions)) return p.medical_conditions;
    try {
      const parsed = JSON.parse(p.medical_conditions);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(p.medical_conditions).split(',');
  };

  const getAllergiesList = (p) => {
    if (!p || !p.allergies) return ['Penicillin', 'Peanuts'];
    if (Array.isArray(p.allergies)) return p.allergies;
    try {
      const parsed = JSON.parse(p.allergies);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(p.allergies).split(',');
  };

  return (
    <div className={inline ? '' : 'dashboard-container'}>
      {!inline && (
        <div className="dashboard-header">
          <h1>Emergency QR Code Scanner</h1>
          <p>Scan a patient's Emergency Health ID QR code or upload an image for immediate triage access</p>
        </div>
      )}

      <div className="dash-card" style={{ maxWidth: '750px', margin: inline ? '0' : '0 auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
          📷 QR Scanner Control Panel
        </h2>

        {/* Action Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {!isScanningCamera ? (
            <button onClick={startCameraScanner} className="btn-primary" style={{ background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              🎥 Start Camera
            </button>
          ) : (
            <button onClick={stopCameraScanner} className="btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              ⏹ Stop Camera
            </button>
          )}

          <button onClick={() => fileInputRef.current.click()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            📁 Upload QR Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          <button onClick={() => processQrText('EMH-100001')} className="btn-secondary" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '700' }}>
            ⚡ Demo QR (John)
          </button>
        </div>

        {/* Hidden temp element for file decoding */}
        <div id="qr-reader-file-temp" style={{ display: 'none' }}></div>

        {/* Camera Video Region */}
        <div 
          id="qr-reader-container" 
          style={{ 
            width: '100%', 
            minHeight: isScanningCamera ? '300px' : '0px', 
            background: isScanningCamera ? '#000000' : 'transparent',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: isScanningCamera ? '1.5rem' : '0'
          }}
        ></div>

        {/* Manual Lookup Form */}
        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={manualHealthId}
            onChange={(e) => setManualHealthId(e.target.value)}
            placeholder="Or type Health ID manually (e.g. EMH-100001)"
            style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            Lookup ID
          </button>
        </form>

        {errorMsg && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#0284c7', fontWeight: '700' }}>
            🔄 Querying Patient Database...
          </div>
        )}

        {/* Patient Triage Display Card */}
        {patientData && !loading && (
          <div style={{ background: '#f8fafc', borderRadius: '16px', border: '2px solid #10b981', padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-green">✓ PATIENT IDENTIFIED</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {patientData.full_name || patientData.fullName}
                </h3>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', background: '#ef4444', color: 'white', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
                🩸 {patientData.blood_group || 'A+'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>HEALTH ID</span>
                <strong style={{ color: '#0284c7', fontSize: '1.05rem' }}>{patientData.health_id}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AGE / GENDER</span>
                <strong>{patientData.age || 34} yrs / {patientData.gender || 'Male'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>TRIAGE STATUS</span>
                <span className="badge badge-red">CRITICAL SUMMARY</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.85rem', borderRadius: '10px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#c2410c', textTransform: 'uppercase' }}>Medical Conditions</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {getConditionsList(patientData).map((c, idx) => (
                    <span key={idx} className="badge badge-amber">{c.trim()}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.85rem', borderRadius: '10px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#b91c1c', textTransform: 'uppercase' }}>Severe Allergies</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {getAllergiesList(patientData).map((a, idx) => (
                    <span key={idx} className="badge badge-red">⚠️ {a.trim()}</span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>📞 Emergency Contacts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {contacts.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.875rem' }}><strong>{c.name}</strong> ({c.relationship})</span>
                    <a href={`tel:${c.phone}`} style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none', fontSize: '0.875rem' }}>📞 {c.phone}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
