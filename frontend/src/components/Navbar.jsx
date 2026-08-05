import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import './Navbar.css';

function Navbar() {
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user.fullName || user.email}</span>
              <span className={`navbar-role-tag ${getRoleClass(user.role)}`}>
                {user.role === 'admin' ? 'System Admin' : user.role === 'medic' ? 'Medical Professional' : 'Patient'}
                {user.health_id ? ` • ${user.health_id}` : ''}
              </span>
            </div>

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
  );
}

export default Navbar;
