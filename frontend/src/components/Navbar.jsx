import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import UserProfileManager from './UserProfileManager';
import './Navbar.css';

function Navbar() {
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleClass = (role) => {
    if (role === 'medic') return 'role-medic';
    if (role === 'admin') return 'role-admin';
    return 'role-patient';
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M2 12h20" strokeLinecap="round" />
              </svg>
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">EMERGENCY HEALTH ID</span>
              <span className="navbar-brand-subtitle">EDHIS System</span>
            </div>
          </Link>

          {user && (
            <div className="navbar-user-section">
              {/* TOP RIGHT CLICKABLE PROFILE BUTTON */}
              <button 
                onClick={() => setShowProfileModal(true)}
                className="navbar-profile-trigger-btn"
                title="Click to manage your profile and credentials"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '0.4rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#ffffff'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: user.role === 'admin' ? '#8b5cf6' : (user.role === 'medic' ? '#10b981' : '#0284c7'),
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}>
                  {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="navbar-user-info" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                  <span className="navbar-user-name" style={{ fontSize: '0.85rem' }}>{user.fullName || user.email}</span>
                  <span className={`navbar-role-tag ${getRoleClass(user.role)}`}>
                    {user.role === 'admin' ? 'System Admin' : user.role === 'medic' ? 'Medical Professional' : 'Patient'}
                    {user.health_id ? ` • ${user.health_id}` : ''}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>✏️ Edit</span>
              </button>

              <button onClick={handleLogout} className="logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* TOP-RIGHT PROFILE MODAL OVERLAY */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)} style={{ zIndex: 2000 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                👤 Manage Account Profile & Credentials
              </h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="btn-secondary" 
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>

            <UserProfileManager 
              onSaveSuccess={() => {
                setShowProfileModal(false);
              }} 
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
