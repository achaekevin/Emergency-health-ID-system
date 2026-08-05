import { useState } from 'react';

function MedicalTimeline({ events = [] }) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedVersionId, setExpandedVersionId] = useState(null);

  const defaultEvents = [
    {
      id: 101,
      year: '2026',
      date: '2026-08-04',
      stage: 'Emergency Visit',
      title: 'ER Triage & High BP Stabilization',
      facility: 'City General Hospital ER',
      doctor: 'Dr. Sarah Johnson',
      details: 'Patient presented with acute hypertensive symptoms (160/100 mmHg) and dizziness.',
      category: 'Emergency',
      versionHistory: [
        { version: 2, editor: 'Dr. Sarah Johnson', timestamp: '2026-08-04 14:30', changes: 'Added ECG procedure result & Troponin negative note.' },
        { version: 1, editor: 'Triage Nurse', timestamp: '2026-08-04 14:00', changes: 'Initial emergency admission intake.' }
      ]
    },
    {
      id: 102,
      year: '2026',
      date: '2026-08-04',
      stage: 'Diagnosis',
      title: 'Acute Hypertensive Episode',
      facility: 'City General Hospital ER',
      doctor: 'Dr. Sarah Johnson',
      details: 'Confirmed primary hypertension spike triggered by stress; cardiac enzymes normal.',
      category: 'Diagnosis',
      versionHistory: [
        { version: 1, editor: 'Dr. Sarah Johnson', timestamp: '2026-08-04 14:45', changes: 'Created initial diagnosis record.' }
      ]
    },
    {
      id: 103,
      year: '2026',
      date: '2026-08-04',
      stage: 'Medication Issued',
      title: 'Lisinopril 10mg Once Daily',
      facility: 'City ER Pharmacy',
      doctor: 'Dr. Sarah Johnson',
      details: 'Prescribed sublingual dose and 30-day oral maintenance course.',
      category: 'Prescription',
      versionHistory: []
    },
    {
      id: 104,
      year: '2026',
      date: '2026-08-05',
      stage: 'Lab Results',
      title: '12-Lead ECG & Blood Chemistry Panel',
      facility: 'City Diagnostic Lab',
      doctor: 'Dr. Marcus Vance',
      details: 'ECG normal sinus rhythm. Serum potassium 4.2 mEq/L (Normal).',
      category: 'Lab Test',
      versionHistory: []
    },
    {
      id: 105,
      year: '2026',
      date: '2026-08-05',
      stage: 'Discharge Summary',
      title: 'Discharged in Stable Condition',
      facility: 'City General Hospital',
      doctor: 'Dr. Sarah Johnson',
      details: 'BP stabilized to 122/80 mmHg. Discharge instructions provided with 48h cardiology follow-up.',
      category: 'Discharge',
      versionHistory: []
    }
  ];

  const timelineList = events.length > 0 ? events : defaultEvents;

  const filteredEvents = selectedFilter === 'All' 
    ? timelineList 
    : timelineList.filter(e => e.category === selectedFilter);

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case 'Emergency Visit': return 'badge-red';
      case 'Diagnosis': return 'badge-amber';
      case 'Medication Issued': return 'badge-green';
      case 'Lab Results': return 'badge-patient';
      case 'Discharge Summary': return 'badge-medic';
      default: return 'badge-patient';
    }
  };

  return (
    <div className="dash-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>📈 Chronological Medical History Timeline</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Interactive visual care pathway & record versioning history</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['All', 'Emergency', 'Diagnosis', 'Prescription', 'Lab Test', 'Discharge'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`sub-nav-pill ${selectedFilter === cat ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.75rem', borderLeft: '3px solid #0284c7', margin: '1rem 0 0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {filteredEvents.map((evt, idx) => (
          <div key={evt.id} style={{ position: 'relative' }}>
            {/* Timeline Dot Indicator */}
            <div style={{
              position: 'absolute',
              left: '-2.35rem',
              top: '0.2rem',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#0284c7',
              border: '4px solid #ffffff',
              boxShadow: '0 0 0 2px #0284c7'
            }} />

            <div style={{ background: '#f8fafc', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${getStageBadgeColor(evt.stage)}`}>{evt.stage}</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{evt.title}</strong>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>📅 {evt.date}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0.35rem 0 0.6rem' }}>{evt.details}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <span>🏥 {evt.facility} • 🩺 {evt.doctor}</span>
                {evt.versionHistory && evt.versionHistory.length > 0 && (
                  <button
                    onClick={() => setExpandedVersionId(expandedVersionId === evt.id ? null : evt.id)}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    📜 Version History ({evt.versionHistory.length})
                  </button>
                )}
              </div>

              {/* Versioning History Audit Panel */}
              {expandedVersionId === evt.id && evt.versionHistory && (
                <div style={{ marginTop: '0.75rem', background: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Record Revision History (Immutable Trail)
                  </h5>
                  {evt.versionHistory.map(v => (
                    <div key={v.version} style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.35rem', paddingBottom: '0.35rem', borderBottom: '1px dashed #cbd5e1' }}>
                      <strong>v{v.version}</strong> — Edited by <em>{v.editor}</em> on {v.timestamp}
                      <div style={{ color: '#0369a1', marginTop: '0.1rem' }}>Diff: {v.changes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicalTimeline;
