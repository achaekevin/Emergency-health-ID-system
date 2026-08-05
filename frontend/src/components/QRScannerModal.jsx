import QRScanner from './QRScanner';

function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '750px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            📷 Live QR Scanner & Health ID Reader
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', color: '#64748b', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <QRScanner 
          inline={true} 
          onScanSuccess={(patient) => {
            if (onScanSuccess) onScanSuccess(patient);
          }} 
        />
      </div>
    </div>
  );
}

export default QRScannerModal;
