import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  // Active tab state
  const [activeTab, setActiveTab] = useState('executive');
  const [userMgmtSubTab, setUserMgmtSubTab] = useState('patients');

  // Stats
  const [stats] = useState({
    totalPatients: 1420,
    activePatients: 1390,
    totalMedics: 84,
    pendingVerifications: 5,
    totalScans: 4820,
    todayScans: 142,
    monthlyRegistrations: 185,
    systemUptime: '99.98%'
  });

  // Users Registry State
  const [patients, setPatients] = useState([
    { id: 1, authId: 'p1', healthId: 'EMH-100001', name: 'John Doe', email: 'patient@test.com', status: 'Active', dob: '1990-05-14', created: '2026-01-10' },
    { id: 2, authId: 'p2', healthId: 'EMH-100002', name: 'Jane Smith', email: 'jane@test.com', status: 'Active', dob: '1985-11-20', created: '2026-02-15' },
    { id: 3, authId: 'p3', healthId: 'EMH-100003', name: 'Michael Brown', email: 'mbrown@test.com', status: 'Suspended', dob: '1978-03-05', created: '2026-03-01' }
  ]);

  const [medics, setMedics] = useState([
    { id: 1, authId: 'm1', name: 'Dr. Sarah Johnson', email: 'medic@test.com', license: 'MED-2024-12345', hospital: 'City General Hospital', isVerified: true, status: 'Active' },
    { id: 2, authId: 'm2', name: 'Dr. Marcus Vance', email: 'marcus@hospital.org', license: 'MED-2025-99812', hospital: 'St. Jude ER', isVerified: false, status: 'Pending Verification' }
  ]);

  const [admins, setAdmins] = useState([
    { id: 1, authId: 'a1', name: 'System Administrator', email: 'admin@edhis.com', role: 'Super Admin', status: 'Active' }
  ]);

  const [auditLogs] = useState([
    { id: 1, user: 'Dr. Sarah Johnson', role: 'Medic', action: 'QR Triage Scan', target: 'EMH-100001', ip: '192.168.1.45', timestamp: '2026-08-05 09:10 EST', status: 'Success' },
    { id: 2, user: 'System Administrator', role: 'Admin', action: 'Verified License', target: 'MED-2024-12345', ip: '127.0.0.1', timestamp: '2026-08-04 16:30 EST', status: 'Success' },
    { id: 3, user: 'John Doe', role: 'Patient', action: 'Update Emergency Contact', target: 'Sarah Doe', ip: '10.0.0.12', timestamp: '2026-08-04 14:15 EST', status: 'Success' }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Scheduled Database Maintenance', target: 'All Users', date: '2026-08-10', type: 'Maintenance' }
  ]);

  const [supportTickets, setSupportTickets] = useState([
    { id: 1, user: 'John Doe', subject: 'Cannot update insurance provider', priority: 'Medium', status: 'Open', date: '2026-08-04' }
  ]);

  // Modal & Form states
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin' });
  const [broadcastMessage, setBroadcastMessage] = useState({ title: '', target: 'All Users', message: '' });

  // Handlers
  const handleTogglePatientStatus = (id) => {
    setPatients(patients.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Suspended' : 'Active' } : p));
  };

  const handleVerifyMedic = (id) => {
    setMedics(medics.map(m => m.id === id ? { ...m, isVerified: true, status: 'Active' } : m));
    alert('Medical Professional license verified and account activated!');
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    setAdmins([...admins, { id: Date.now(), authId: `a_${Date.now()}`, ...newAdmin, status: 'Active' }]);
    setNewAdmin({ name: '', email: '', role: 'Admin' });
    setShowCreateAdminModal(false);
    alert('New Administrator account created successfully!');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    setAnnouncements([{ id: Date.now(), title: broadcastMessage.title, target: broadcastMessage.target, date: new Date().toISOString().slice(0, 10), type: 'Broadcast' }, ...announcements]);
    setBroadcastMessage({ title: '', target: 'All Users', message: '' });
    alert('Broadcast announcement dispatched to all platform users!');
  };

  const handleExportReport = (type, format) => {
    alert(`Exporting ${type} Report in ${format} format... Download will start automatically.`);
  };

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)', color: '#fff', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-admin" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>SYSTEM ADMINISTRATOR PORTAL</span>
              <span style={{ fontSize: '0.8rem', color: '#e9d5ff' }}>Platform Version v2.4.0</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Platform Governance & System Administration</h1>
            <p style={{ color: '#f3e8ff', fontSize: '0.9rem' }}>User lifecycle, License Verification, Audit Trail, Analytics, Security & Backups</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f3e8ff' }}>System Health</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.2rem 0', color: '#4ade80' }}>99.98% Uptime</div>
            <span style={{ fontSize: '0.75rem', color: '#e9d5ff' }}>All Services Operational</span>
          </div>
        </div>
      </div>

      {/* Navigation Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-section-title">Overview & Users</div>
          <button className={`sidebar-nav-btn ${activeTab === 'executive' ? 'active' : ''}`} onClick={() => setActiveTab('executive')}>
            📊 Executive Dashboard
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'user_management' ? 'active' : ''}`} onClick={() => setActiveTab('user_management')}>
            👥 User Management
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'verification_center' ? 'active' : ''}`} onClick={() => setActiveTab('verification_center')}>
            🛡️ Verification Center ({stats.pendingVerifications})
          </button>

          <div className="sidebar-section-title">Monitoring & Logs</div>
          <button className={`sidebar-nav-btn ${activeTab === 'qr_monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('qr_monitoring')}>
            📱 QR Scan Monitoring
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'audit_logs' ? 'active' : ''}`} onClick={() => setActiveTab('audit_logs')}>
            📜 System Audit Logs
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            📥 Reports Generator
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'system_analytics' ? 'active' : ''}`} onClick={() => setActiveTab('system_analytics')}>
            📈 System Analytics
          </button>

          <div className="sidebar-section-title">Platform Config</div>
          <button className={`sidebar-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            📢 Notification Dispatcher
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'role_permissions' ? 'active' : ''}`} onClick={() => setActiveTab('role_permissions')}>
            🔐 Roles & Permissions
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'system_config' ? 'active' : ''}`} onClick={() => setActiveTab('system_config')}>
            ⚙️ System Configuration
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'security_center' ? 'active' : ''}`} onClick={() => setActiveTab('security_center')}>
            🔒 Security Center
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'backup_recovery' ? 'active' : ''}`} onClick={() => setActiveTab('backup_recovery')}>
            💾 Backup & Recovery
          </button>
          <button className={`sidebar-nav-btn ${activeTab === 'feedback_support' ? 'active' : ''}`} onClick={() => setActiveTab('feedback_support')}>
            🎧 Support Tickets ({supportTickets.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="dashboard-main-content">

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'executive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-4">
                <div className="dash-card" style={{ borderLeft: '4px solid #0284c7' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TOTAL PATIENTS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>{stats.totalPatients}</div>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>{stats.activePatients} Active</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>MEDICAL PROFESSIONALS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>{stats.totalMedics}</div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{stats.pendingVerifications} Pending Verification</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>TOTAL QR SCANS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>{stats.totalScans}</div>
                  <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>+{stats.todayScans} Scans Today</span>
                </div>
                <div className="dash-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>MONTHLY REGISTRATIONS</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>+{stats.monthlyRegistrations}</div>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Up 14% vs last month</span>
                </div>
              </div>

              <div className="dash-card">
                <h3 className="card-title">🚨 Executive Platform Summary</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                  All system operations, identity verification queues, emergency QR scanner gateways, and API endpoints are running normally. No security breaches or unauthorized record access attempts detected in the last 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'user_management' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="sub-nav-bar">
                <button className={`sub-nav-pill ${userMgmtSubTab === 'patients' ? 'active' : ''}`} onClick={() => setUserMgmtSubTab('patients')}>Patients ({patients.length})</button>
                <button className={`sub-nav-pill ${userMgmtSubTab === 'medics' ? 'active' : ''}`} onClick={() => setUserMgmtSubTab('medics')}>Medical Professionals ({medics.length})</button>
                <button className={`sub-nav-pill ${userMgmtSubTab === 'admins' ? 'active' : ''}`} onClick={() => setUserMgmtSubTab('admins')}>Administrators ({admins.length})</button>
              </div>

              {/* Sub tab: Patients */}
              {userMgmtSubTab === 'patients' && (
                <div className="dash-card">
                  <h3 className="card-title">👤 Patient User Registry</h3>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Health ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>DOB</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.healthId}</strong></td>
                          <td>{p.name}</td>
                          <td>{p.email}</td>
                          <td>{p.dob}</td>
                          <td><span className={p.status === 'Active' ? 'badge badge-green' : 'badge badge-red'}>{p.status}</span></td>
                          <td style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleTogglePatientStatus(p.id)} className={p.status === 'Active' ? 'btn-danger' : 'btn-success'} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                              {p.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button onClick={() => alert(`Reset password link sent to ${p.email}`)} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reset Password</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub tab: Medics */}
              {userMgmtSubTab === 'medics' && (
                <div className="dash-card">
                  <h3 className="card-title">🩺 Medical Professional Registry</h3>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>License Number</th>
                        <th>Hospital</th>
                        <th>Verification</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medics.map(m => (
                        <tr key={m.id}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.email}</td>
                          <td>{m.license}</td>
                          <td>{m.hospital}</td>
                          <td><span className={m.isVerified ? 'badge badge-green' : 'badge badge-amber'}>{m.isVerified ? 'Verified Doctor' : 'Pending'}</span></td>
                          <td>
                            {!m.isVerified ? (
                              <button onClick={() => handleVerifyMedic(m.id)} className="btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Verify License</button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>Active & Verified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub tab: Admins */}
              {userMgmtSubTab === 'admins' && (
                <div className="dash-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>🛡️ Administrator Accounts</h3>
                    <button onClick={() => setShowCreateAdminModal(true)} className="btn-primary" style={{ fontSize: '0.8rem' }}>+ Create Admin</button>
                  </div>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.name}</strong></td>
                          <td>{a.email}</td>
                          <td><span className="badge badge-admin">{a.role}</span></td>
                          <td><span className="badge badge-green">{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VERIFICATION CENTER */}
          {activeTab === 'verification_center' && (
            <div className="dash-card">
              <h3 className="card-title">🛡️ Medical License Verification Queue</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Verify practitioner identity and medical credentials against national medical registry before granting clinical access.
              </p>
              {medics.filter(m => !m.isVerified).length === 0 ? (
                <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center', color: '#15803d' }}>
                  ✅ No pending medical license verifications. All medical professionals verified!
                </div>
              ) : (
                medics.filter(m => !m.isVerified).map(m => (
                  <div key={m.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{m.name}</strong> ({m.email})
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>License Number: <strong>{m.license}</strong> • Hospital: {m.hospital}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => handleVerifyMedic(m.id)} className="btn-success">Approve & Verify License</button>
                      <button onClick={() => alert('License registration rejected.')} className="btn-danger">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: QR MONITORING */}
          {activeTab === 'qr_monitoring' && (
            <div className="dash-card">
              <h3 className="card-title">📱 Emergency QR Scan Monitoring</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL SCANS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>4,820</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#166534' }}>SUCCESSFUL SCANS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d' }}>4,814 (99.87%)</div>
                </div>
                <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>FAILED / EXPIRED TOKENS</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b91c1c' }}>6</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="dash-card">
              <h3 className="card-title">📜 Immutable System Audit Logs</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Target / ID</th>
                    <th>IP Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(l => (
                    <tr key={l.id}>
                      <td>{l.timestamp}</td>
                      <td><strong>{l.user}</strong></td>
                      <td><span className={`badge ${l.role === 'Admin' ? 'badge-admin' : (l.role === 'Medic' ? 'badge-medic' : 'badge-patient')}`}>{l.role}</span></td>
                      <td>{l.action}</td>
                      <td>{l.target}</td>
                      <td>{l.ip}</td>
                      <td><span className="badge badge-green">{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="dash-card">
              <h3 className="card-title">📥 System Reports Generator & Data Export</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4>Patient Health & Demographics Summary</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>Export overall patient registration, blood group distribution, and chronic condition statistics.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleExportReport('Patient Demographics', 'PDF')} className="btn-primary" style={{ fontSize: '0.75rem' }}>PDF</button>
                    <button onClick={() => handleExportReport('Patient Demographics', 'CSV')} className="btn-secondary" style={{ fontSize: '0.75rem' }}>CSV</button>
                    <button onClick={() => handleExportReport('Patient Demographics', 'Excel')} className="btn-secondary" style={{ fontSize: '0.75rem' }}>Excel</button>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4>Emergency QR Scan Audit Report</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem' }}>Detailed log of all emergency triage scans, hospital response times, and doctor access.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleExportReport('QR Scan Audit', 'PDF')} className="btn-primary" style={{ fontSize: '0.75rem' }}>PDF</button>
                    <button onClick={() => handleExportReport('QR Scan Audit', 'CSV')} className="btn-secondary" style={{ fontSize: '0.75rem' }}>CSV</button>
                    <button onClick={() => handleExportReport('QR Scan Audit', 'Excel')} className="btn-secondary" style={{ fontSize: '0.75rem' }}>Excel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM ANALYTICS */}
          {activeTab === 'system_analytics' && (
            <div className="dash-card">
              <h3 className="card-title">📈 Platform Analytics & Medical Trends</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Most Common Conditions Recorded</h4>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.25rem' }}>
                    <li>Diabetes Type 2 — 38%</li>
                    <li>Hypertension — 32%</li>
                    <li>Asthma & Respiratory — 18%</li>
                    <li>Cardiovascular Disease — 12%</li>
                  </ul>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Top Recorded Allergies</h4>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.25rem' }}>
                    <li>Penicillin / Antibiotics — 44%</li>
                    <li>Peanuts / Tree Nuts — 26%</li>
                    <li>Sulfa Drugs — 18%</li>
                    <li>Latex — 12%</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: NOTIFICATION DISPATCHER */}
          {activeTab === 'notifications' && (
            <div className="dash-card">
              <h3 className="card-title">📢 Broadcast System Announcements</h3>
              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Announcement Title</label>
                  <input type="text" required placeholder="e.g. System Maintenance Notice" value={broadcastMessage.title} onChange={(e) => setBroadcastMessage({ ...broadcastMessage, title: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Target Audience</label>
                  <select value={broadcastMessage.target} onChange={(e) => setBroadcastMessage({ ...broadcastMessage, target: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="All Users">All Platform Users</option>
                    <option value="Patients">Patients Only</option>
                    <option value="Medical Professionals">Medical Professionals Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Message Body</label>
                  <textarea required placeholder="Write announcement details..." value={broadcastMessage.message} onChange={(e) => setBroadcastMessage({ ...broadcastMessage, message: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', height: '90px' }} />
                </div>
                <button type="submit" className="btn-primary">📡 Dispatch Broadcast Notification</button>
              </form>

              <h4>Active Announcements</h4>
              {announcements.map(a => (
                <div key={a.id} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{a.title}</strong> ({a.target})
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{a.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 9: ROLES & PERMISSIONS */}
          {activeTab === 'role_permissions' && (
            <div className="dash-card">
              <h3 className="card-title">🔐 Role & Permission Matrix</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Capability / Task</th>
                    <th>Patient</th>
                    <th>Medical Professional</th>
                    <th>Administrator</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Manage Personal Vitals & Emergency Contacts</td>
                    <td>✅ Full Access</td>
                    <td>❌ Read Only</td>
                    <td>❌ No Access</td>
                  </tr>
                  <tr>
                    <td>Scan Emergency QR & View Triage</td>
                    <td>✅ View Own Card</td>
                    <td>✅ Full ER Triage</td>
                    <td>❌ No Access</td>
                  </tr>
                  <tr>
                    <td>Create Clinical Encounters & Prescriptions</td>
                    <td>❌ Restricted</td>
                    <td>✅ Full Clinical Access</td>
                    <td>❌ Strictly Forbidden</td>
                  </tr>
                  <tr>
                    <td>Manage Platform Users & License Verification</td>
                    <td>❌ Restricted</td>
                    <td>❌ Restricted</td>
                    <td>✅ Full System Control</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 10: SYSTEM CONFIG */}
          {activeTab === 'system_config' && (
            <div className="dash-card">
              <h3 className="card-title">⚙️ System Configuration Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>JWT Access Token Expiry</label>
                  <input type="text" defaultValue="24h" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Inactivity Session Timeout</label>
                  <input type="text" defaultValue="15 mins" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>SMS Gateway Service</label>
                  <input type="text" defaultValue="Twilio production gateway" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Password Policy</label>
                  <input type="text" defaultValue="Min 8 chars, 1 uppercase, 1 symbol" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button onClick={() => alert('System Configuration updated!')} className="btn-primary">💾 Save System Configuration</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SECURITY CENTER */}
          {activeTab === 'security_center' && (
            <div className="dash-card">
              <h3 className="card-title">🔒 Platform Security Center</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Revoke All Active Sessions</strong>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Force logout across all web & mobile clients for emergency patch.</p>
                  </div>
                  <button onClick={() => alert('All user tokens revoked.')} className="btn-danger">Revoke Tokens</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: BACKUP & RECOVERY */}
          {activeTab === 'backup_recovery' && (
            <div className="dash-card">
              <h3 className="card-title">💾 Database Backup & Recovery</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button onClick={() => alert('Manual Database Backup initiated... Export saved to backup/snapshot_20260805.sql')} className="btn-primary">💾 Trigger Instant Database Backup</button>
                <button onClick={() => alert('Restoring last healthy snapshot...')} className="btn-secondary">🔄 Restore Database</button>
              </div>
            </div>
          )}

          {/* TAB 13: SUPPORT TICKETS */}
          {activeTab === 'feedback_support' && (
            <div className="dash-card">
              <h3 className="card-title">🎧 User Feedback & Support Tickets</h3>
              {supportTickets.map(t => (
                <div key={t.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{t.subject}</strong> ({t.user})
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {t.date} • Priority: {t.priority}</p>
                  </div>
                  <button onClick={() => { setSupportTickets(supportTickets.map(x => x.id === t.id ? { ...x, status: 'Resolved' } : x)); alert('Ticket resolved!'); }} className="btn-success">Resolve Ticket</button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showCreateAdminModal && (
        <div className="modal-overlay" onClick={() => setShowCreateAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Administrator Account</h3>
            <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Full Name" required value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="email" placeholder="Email Address" required value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="Admin">System Administrator</option>
                <option value="Super Admin">Super Administrator</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Account</button>
                <button type="button" onClick={() => setShowCreateAdminModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
