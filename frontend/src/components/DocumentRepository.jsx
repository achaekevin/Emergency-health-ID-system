import { useState } from 'react';

function DocumentRepository() {
  const [documents, setDocuments] = useState([
    { id: 1, title: 'Chest_XRay_Pneumonia_Scan.png', category: 'X-Ray', uploadedAt: '2026-08-01', size: '3.4 MB', doctor: 'Dr. Sarah Johnson', previewUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600', type: 'image' },
    { id: 2, title: 'Brain_MRI_Neurology_Report.pdf', category: 'MRI Scan', uploadedAt: '2026-07-15', size: '8.2 MB', doctor: 'Dr. Marcus Vance', previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf' },
    { id: 3, title: 'Abdominal_CT_Scan_Results.png', category: 'CT Scan', uploadedAt: '2026-06-20', size: '5.1 MB', doctor: 'City Imaging Center', previewUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600', type: 'image' },
    { id: 4, title: '12_Lead_ECG_Cardiology_Trace.pdf', category: 'ECG Report', uploadedAt: '2026-07-20', size: '1.1 MB', doctor: 'Dr. Sarah Johnson', previewUrl: '', type: 'pdf' },
    { id: 5, title: 'Discharge_Summary_City_Hospital.pdf', category: 'Discharge Summary', uploadedAt: '2026-08-05', size: '450 KB', doctor: 'City General Hospital', previewUrl: '', type: 'pdf' }
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'X-Ray', doctor: '' });

  const categories = ['All', 'X-Ray', 'MRI Scan', 'CT Scan', 'ECG Report', 'Lab Report', 'Discharge Summary', 'Referral Letter'];

  const filteredDocs = activeCategory === 'All' 
    ? documents 
    : documents.filter(d => d.category === activeCategory);

  const handleUploadDoc = (e) => {
    e.preventDefault();
    setDocuments([
      {
        id: Date.now(),
        title: newDoc.title || 'Uploaded_Medical_Doc.pdf',
        category: newDoc.category,
        uploadedAt: new Date().toISOString().slice(0, 10),
        size: '1.8 MB',
        doctor: newDoc.doctor || 'Attending Physician',
        type: newDoc.title.endsWith('.png') || newDoc.title.endsWith('.jpg') ? 'image' : 'pdf'
      },
      ...documents
    ]);
    setNewDoc({ title: '', category: 'X-Ray', doctor: '' });
    setShowUploadModal(false);
    alert('Medical document uploaded and encrypted in repository!');
  };

  return (
    <div className="dash-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>📁 Secure Medical Document & Imaging Repository</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Store, view and preview X-rays, MRI, CT scans, ECGs, Lab reports & Referral letters</span>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          📤 Upload Medical Document / Scan
        </button>
      </div>

      {/* Category Pills */}
      <div className="sub-nav-bar" style={{ marginBottom: '1rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`sub-nav-pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document List */}
      <table className="custom-table">
        <thead>
          <tr>
            <th>Document / Scan Title</th>
            <th>Category</th>
            <th>Uploaded Date</th>
            <th>File Size</th>
            <th>Ordering Doctor / Facility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocs.map(doc => (
            <tr key={doc.id}>
              <td><strong>{doc.title}</strong></td>
              <td><span className="badge badge-patient">{doc.category}</span></td>
              <td>{doc.uploadedAt}</td>
              <td>{doc.size}</td>
              <td>{doc.doctor}</td>
              <td style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="btn-primary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => alert(`Downloading encrypted ${doc.title}...`)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                >
                  📥 Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>👁️ Preview: {previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="btn-secondary" style={{ padding: '0.2rem 0.6rem' }}>✕ Close</button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem', textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {previewDoc.previewUrl ? (
                previewDoc.type === 'image' ? (
                  <img src={previewDoc.previewUrl} alt={previewDoc.title} style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '100%', height: '400px' }}>
                    <iframe src={previewDoc.previewUrl} title={previewDoc.title} style={{ width: '100%', height: '100%', border: 'none' }} />
                  </div>
                )
              ) : (
                <div style={{ padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>Encrypted PDF Medical Document</strong>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>{previewDoc.category} ordering doctor: {previewDoc.doctor}</p>
                  <button onClick={() => alert(`Opening encrypted viewer for ${previewDoc.title}...`)} className="btn-primary">Launch Secure Viewer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Medical Document / Diagnostic Scan</h3>
            <form onSubmit={handleUploadDoc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input
                type="text" required placeholder="Document Title (e.g. Chest_XRay_2026.png)"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <select
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text" placeholder="Ordering Doctor / Medical Facility"
                value={newDoc.doctor}
                onChange={(e) => setNewDoc({ ...newDoc, doctor: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input type="file" required style={{ padding: '0.6rem', background: '#f8fafc', borderRadius: '8px' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Upload & Encrypt</button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentRepository;
