import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth || {});

  // System stats & list states
  const [stats, setStats] = useState({
    totalUsers: 4,
    totalPatients: 2,
    totalMedics: 1,
    verifiedMedics: 1,
    totalAdmins: 1,
    totalScans: 28,
    totalMedicalRecords: 15
  });

  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state for creating user
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: 'Password123',
    fullName: '',
    role: 'patient',
    specialization: 'Emergency Medicine',
    licenseNumber: '',
    hospital: 'City Hospital'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats');
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.data);
      }

      // 2. Fetch Users
      const usersRes = await fetch('http://localhost:5000/api/admin/users');
      const usersJson = await usersRes.json();
      if (usersJson.success && Array.isArray(usersJson.data)) {
        setUsersList(usersJson.data);
      } else {
        // Fallback seed
        setUsersList([
          { authId: 'auth_admin_001', email: 'admin@edhis.com', fullName: 'System Administrator', role: 'admin', isActive: true, isVerified: true, createdAt: '2026-08-04' },
          { authId: 'auth_medic_001', email: 'medic@test.com', fullName: 'Dr. Sarah Johnson', role: 'medic', specialization: 'Emergency Medicine', licenseNumber: 'MED-2024-12345', hospital: 'City General Hospital', isActive: true, isVerified: true, createdAt: '2026-08-04' },
          { authId: 'auth_patient_001', email: 'patient@test.com', fullName: 'John Doe', role: 'patient', healthId: 'EMH-100001', isActive: true, isVerified: true, createdAt: '2026-08-04' },
          { authId: 'auth_patient_002', email: 'jane@test.com', fullName: 'Jane Smith', role: 'patient', healthId: 'EMH-100002', isActive: true, isVerified: true, createdAt: '2026-08-04' }
        ]);
      }

      // 3. Fetch Audit Logs
      const logsRes = await fetch('http://localhost:5000/api/admin/audit-logs');
      const logsJson = await logsRes.json();
      if (logsJson.success && Array.isArray(logsJson.data)) {
        setAuditLogs(logsJson.data);
      } else {
        setAuditLogs([
          { id: 1, user_id: 'auth_admin_001', user_type: 'admin', action: 'login', status: 'success', ip_address: '127.0.0.1', timestamp: new Date().toISOString() },
          { id: 2, user_id: 'auth_medic_001', user_type: 'medic', action: 'scan_patient', status: 'success', ip_address: '127.0.0.1', timestamp: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userObj) => {
    const updatedStatus = !userObj.isActive;
    try {
      await fetch(`http://localhost:5000/api/admin/users/${userObj.authId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updatedStatus, role: userObj.role })
      });
      setUsersList(usersList.map(u => u.authId === userObj.authId ? { ...u, isActive: updatedStatus } : u));
    } catch (err) {
      setUsersList(usersList.map(u => u.authId === userObj.authId ? { ...u, isActive: updatedStatus } : u));
    }
  };

  const handleToggleVerification = async (medicObj) => {
    const updatedVerify = !medicObj.isVerified;
    try {
      await fetch(`http://localhost:5000/api/admin/medics/${medicObj.authId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: updatedVerify })
      });
      setUsersList(usersList.map(u => u.authId === medicObj.authId ? { ...u, isVerified: updatedVerify } : u));
    } catch (err) {
      setUsersList(usersList.map(u => u.authId === medicObj.authId ? { ...u, isVerified: updatedVerify } : u));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      alert(data.message || 'User created!');
      setShowCreateUserModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.email.toLowerCase().includes(q) || (u.fullName && u.fullName.toLowerCase().includes(q)) || (u.healthId && u.healthId.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6b21a8 100%)', color: 'white', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-admin" style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>SYSTEM CONTROL CENTER</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.2rem' }}>
              Administrator Dashboard
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#e9d5ff', marginTop: '0.2rem' }}>
              Logged in as: <strong>{user?.email || 'admin@edhis.com'}</strong> • System Version: <strong>1.0.0</strong>
            </p>
          </div>

          <button onClick={() => setShowCreateUserModal(true)} className="btn-primary" style={{ background: '#10b981', padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}>
            + Create New User Account
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Registered Users</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>{stats.totalUsers || usersList.length}</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across all system roles</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Patients (Health IDs)</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', marginTop: '0.25rem' }}>{stats.totalPatients}</h3>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '600' }}>Active emergency records</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Medical Professionals</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '0.25rem' }}>{stats.totalMedics}</h3>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>{stats.verifiedMedics} Verified Medics</span>
        </div>

        <div className="dash-card">
          <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>Emergency Scans</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.25rem' }}>{stats.totalScans}</h3>
          <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>Total triage events</span>
        </div>
      </div>

      {/* User Management Hub */}
      <div className="dash-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>👥 System User Management</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage profiles, assign permissions, and verify medical personnel</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients Only</option>
              <option value="medic">Medics Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>User / Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Health ID / License</th>
              <th>Verification</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.authId}>
                <td>
                  <strong>{u.fullName || u.email}</strong>
                  {u.hospital && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{u.hospital}</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-admin' : u.role === 'medic' ? 'badge-medic' : 'badge-patient'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.role === 'patient' && <strong style={{ color: '#0284c7' }}>{u.healthId || 'EMH-100001'}</strong>}
                  {u.role === 'medic' && <span style={{ fontSize: '0.85rem', color: '#475569' }}>{u.licenseNumber || 'MED-2024-12345'}</span>}
                  {u.role === 'admin' && <span style={{ color: '#64748b' }}>Full Access</span>}
                </td>
                <td>
                  {u.role === 'medic' ? (
                    <button 
                      onClick={() => handleToggleVerification(u)}
                      className={`btn-${u.isVerified ? 'success' : 'danger'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {u.isVerified ? '✓ Verified' : 'Unverified'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>N/A</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {u.role !== 'admin' && (
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Logs Stream */}
      <div className="dash-card">
        <h3 className="card-title">🛡️ System Security & Audit Log</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>User Type</th>
              <th>Action</th>
              <th>Status</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, i) => (
              <tr key={i}>
                <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}</td>
                <td><code>{log.user_id}</code></td>
                <td><span className="badge badge-patient">{log.user_type}</span></td>
                <td><strong>{log.action}</strong></td>
                <td><span className="badge badge-green">{log.status}</span></td>
                <td>{log.ip_address || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Create User */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem' }}>Create New User Account</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Full Name</label>
                <input 
                  type="text" required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="e.g. Dr. Robert Vance / Alex Smith"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Email Address</label>
                <input 
                  type="email" required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Role Assignment</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                >
                  <option value="patient">Patient</option>
                  <option value="medic">Medical Professional (Medic)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              {newUser.role === 'medic' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Specialization</label>
                    <input 
                      type="text"
                      value={newUser.specialization}
                      onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Hospital Affiliation</label>
                    <input 
                      type="text"
                      value={newUser.hospital}
                      onChange={(e) => setNewUser({ ...newUser, hospital: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Initial Password</label>
                <input 
                  type="password" required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: '#10b981' }}>Create User</button>
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
