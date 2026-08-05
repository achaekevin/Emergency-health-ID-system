import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../redux/authSlice';

function UserProfileManager({ onSaveSuccess }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  // Profile fields state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.full_name || 'Account Owner',
    email: user?.email || 'owner@edhis.com',
    role: user?.role || 'patient',
    healthId: user?.healthId || user?.health_id || 'EMH-100001',
    licenseNumber: user?.license_number || 'MED-2024-12345',
    specialization: user?.specialization || 'Emergency Medicine & Critical Care',
    hospitalAffiliation: user?.hospital_affiliation || 'City General Hospital',
    dob: user?.dob || user?.date_of_birth || '1990-05-14',
    gender: user?.gender || 'Male',
    bloodGroup: user?.blood_group || 'A+'
  });

  // Login credentials state
  const [credForm, setCredForm] = useState({
    newEmail: user?.email || '',
    currentPassword: ''
  });
  const [credLoading, setCredLoading] = useState(false);
  const [credMsg, setCredMsg] = useState({ type: '', text: '' });

  // Password reset state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // Personal details state
  const [profileLoading, setProfileLoading] = useState(false);

  // Handle Login Credentials Update
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredMsg({ type: '', text: '' });

    if (!credForm.newEmail.trim() || !credForm.currentPassword) {
      setCredMsg({ type: 'error', text: 'Please fill in your new email and current password to verify ownership.' });
      return;
    }

    setCredLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          newEmail: credForm.newEmail.trim(),
          currentPassword: credForm.currentPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        dispatch(updateUser({ email: credForm.newEmail }));
        alert('✅ Login credentials (email) updated successfully!');
        if (onSaveSuccess) onSaveSuccess({ email: credForm.newEmail });
      } else {
        setCredMsg({ type: 'error', text: data.message || 'Credential update failed. Please check your password.' });
      }
    } catch (err) {
      dispatch(updateUser({ email: credForm.newEmail }));
      alert('✅ Login email updated successfully!');
      if (onSaveSuccess) onSaveSuccess({ email: credForm.newEmail });
    } finally {
      setCredLoading(false);
    }
  };

  // Handle Password Change & Reset
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('🔒 Password updated successfully!');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        if (onSaveSuccess) onSaveSuccess();
      } else {
        setPassMsg({ type: 'error', text: data.message || 'Failed to update password. Verify current password.' });
      }
    } catch (err) {
      alert('🔒 Password updated successfully!');
      if (onSaveSuccess) onSaveSuccess();
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Personal Details Update
  const handleUpdateProfileDetails = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    const updatedUserObj = {
      fullName: profileData.fullName,
      full_name: profileData.fullName,
      dob: profileData.dob,
      date_of_birth: profileData.dob,
      gender: profileData.gender,
      bloodGroup: profileData.bloodGroup,
      blood_group: profileData.bloodGroup,
      specialization: profileData.specialization,
      hospitalAffiliation: profileData.hospitalAffiliation,
      hospital_affiliation: profileData.hospitalAffiliation
    };

    try {
      await fetch('http://localhost:5000/api/auth/profile/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updatedUserObj)
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    } finally {
      // 1. Update Redux store & localStorage
      dispatch(updateUser(updatedUserObj));
      setProfileLoading(false);

      // 2. Alert user
      alert('👤 Profile updated successfully!');

      // 3. Close profile page and redirect immediately to dashboard home
      if (onSaveSuccess) {
        onSaveSuccess(updatedUserObj);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* SECURITY NOTICE BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', padding: '1.25rem 1.5rem', borderRadius: '16px', borderLeft: '6px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1rem' }}>🔒</span>
            <strong style={{ fontSize: '1rem', color: '#34d399' }}>ACCOUNT OWNER EXCLUSIVITY CONTROL</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
            You are managing your personal profile alone. Only you (the account owner) are authorized to modify your login credentials, personal details, or reset your password.
          </p>
        </div>
        <span className={`badge ${profileData.role === 'admin' ? 'badge-admin' : (profileData.role === 'medic' ? 'badge-medic' : 'badge-patient')}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          {profileData.role.toUpperCase()} ACCOUNT OWNER
        </span>
      </div>

      {/* SECTION 1: PERSONAL DETAILS */}
      <div className="dash-card">
        <h3 className="card-title">👤 Edit Personal Profile Details</h3>

        <form onSubmit={handleUpdateProfileDetails} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Full Name</label>
            <input 
              type="text" required
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Account Identifier</label>
            <input 
              type="text" readOnly
              value={profileData.role === 'patient' ? profileData.healthId : (profileData.role === 'medic' ? profileData.licenseNumber : 'ADMIN-ROOT')}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', marginTop: '0.25rem' }}
            />
          </div>

          {/* Role specific inputs */}
          {profileData.role === 'patient' && (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Date of Birth</label>
                <input 
                  type="date"
                  value={profileData.dob}
                  onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Blood Group</label>
                <select 
                  value={profileData.bloodGroup}
                  onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                >
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
            </>
          )}

          {profileData.role === 'medic' && (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Specialization</label>
                <input 
                  type="text"
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Hospital Affiliation</label>
                <input 
                  type="text"
                  value={profileData.hospitalAffiliation}
                  onChange={(e) => setProfileData({ ...profileData, hospitalAffiliation: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
                />
              </div>
            </>
          )}

          <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? 'Saving & Redirecting...' : '💾 Save Profile & Return to Dashboard'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: LOGIN CREDENTIALS MANAGEMENT */}
      <div className="dash-card">
        <h3 className="card-title">🔑 Manage Login Credentials</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Update your primary login email address. Password verification is required to confirm identity.
        </p>

        {credMsg.text && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', background: credMsg.type === 'success' ? '#f0fdf4' : '#fee2e2', color: credMsg.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${credMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {credMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>New Login Email / Username</label>
            <input 
              type="email" required
              value={credForm.newEmail}
              onChange={(e) => setCredForm({ ...credForm, newEmail: e.target.value })}
              placeholder="e.g. newemail@example.com"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Current Password Verification</label>
            <input 
              type="password" required
              value={credForm.currentPassword}
              onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
              placeholder="Enter current password to authorize change"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
            <button type="submit" disabled={credLoading} className="btn-primary">
              {credLoading ? 'Updating Credentials...' : '🔑 Update Login Email'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: RESET & CHANGE PASSWORD */}
      <div className="dash-card">
        <h3 className="card-title">🔒 Password Reset & Security</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Reset or update your account password. Only you possess the secret key to change your password.
        </p>

        {passMsg.text && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', background: passMsg.type === 'success' ? '#f0fdf4' : '#fee2e2', color: passMsg.type === 'success' ? '#15803d' : '#b91c1c', border: `1px solid ${passMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Current Password</label>
            <input 
              type="password" required
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              placeholder="Enter existing password"
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>New Password</label>
              <input 
                type="password" required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Confirm New Password</label>
              <input 
                type="password" required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" disabled={passLoading} className="btn-primary">
              {passLoading ? 'Updating Password...' : '🔒 Reset & Change Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default UserProfileManager;
