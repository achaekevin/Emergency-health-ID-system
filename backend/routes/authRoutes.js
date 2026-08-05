import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'patient' } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    // Validate role
    const validRoles = ['patient', 'medic', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be patient, medic, or admin'
      });
    }

    // Check if user already exists
    const [existingUser] = await query(
      'SELECT id FROM profiles WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique auth_id
    const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create profile
    const profileResult = await query(
      `INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [authId, role, email, hashedPassword]
    );

    // Create role-specific record
    if (role === 'patient') {
      await query(
        `INSERT INTO patients (auth_id, full_name, email, is_active, created_at, updated_at)
         VALUES (?, ?, ?, TRUE, NOW(), NOW())`,
        [authId, fullName, email]
      );
    } else if (role === 'medic') {
      await query(
        `INSERT INTO medics (auth_id, full_name, email, is_active, created_at, updated_at)
         VALUES (?, ?, ?, TRUE, NOW(), NOW())`,
        [authId, fullName, email]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { authId, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        authId,
        email,
        fullName,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    // Validation
    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by normalized email
    const [user] = await query(
      'SELECT * FROM profiles WHERE LOWER(TRIM(email)) = ?',
      [cleanEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get role-specific details
    let fullName = cleanEmail;
    let profileId = null;
    let extraData = {};

    if (user.role === 'patient') {
      const [patient] = await query(
        'SELECT * FROM patients WHERE auth_id = ?',
        [user.auth_id]
      );
      if (patient) {
        fullName = patient.full_name || cleanEmail;
        profileId = patient.id;
        extraData = patient;
      }
    } else if (user.role === 'medic') {
      const [medic] = await query(
        'SELECT * FROM medics WHERE auth_id = ?',
        [user.auth_id]
      );
      if (medic) {
        fullName = medic.full_name || cleanEmail;
        profileId = medic.id;
        extraData = medic;
      }
    } else if (user.role === 'admin') {
      const [admin] = await query(
        'SELECT * FROM admin_settings WHERE auth_id = ?',
        [user.auth_id]
      );
      if (admin) {
        fullName = admin.full_name || 'System Administrator';
        profileId = admin.id;
        extraData = admin;
      } else {
        fullName = 'System Administrator';
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { authId: user.auth_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Try logging audit log safely
    try {
      await query(
        `INSERT INTO audit_logs (user_id, user_type, action, status, ip_address, timestamp)
         VALUES (?, ?, 'login', 'success', ?, NOW())`,
        [user.auth_id, user.role, req.ip || '127.0.0.1']
      );
    } catch (auditErr) {
      console.warn('Could not record audit log:', auditErr.message);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        authId: user.auth_id,
        email: user.email,
        fullName,
        role: user.role,
        profileId,
        ...extraData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user profile
    const [user] = await query(
      'SELECT auth_id, email, role, created_at FROM profiles WHERE auth_id = ?',
      [decoded.authId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get role-specific details
    let profileData = {};

    if (user.role === 'patient') {
      const [patient] = await query(
        `SELECT id, full_name, date_of_birth, age, gender, blood_group, 
                health_id, profile_photo_url, is_active
         FROM patients WHERE auth_id = ?`,
        [user.auth_id]
      );
      if (patient) {
        profileData = patient;
      }
    } else if (user.role === 'medic') {
      const [medic] = await query(
        `SELECT id, full_name, specialization, license_number, 
                qualification, hospital_affiliation, is_verified, is_active
         FROM medics WHERE auth_id = ?`,
        [user.auth_id]
      );
      if (medic) {
        profileData = medic;
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        ...profileData
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user
    const [user] = await query(
      'SELECT password_hash FROM profiles WHERE auth_id = ?',
      [decoded.authId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE profiles SET password_hash = ?, updated_at = NOW() WHERE auth_id = ?',
      [hashedPassword, decoded.authId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Update owner login email / username credentials
router.put('/profile/credentials', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ success: false, message: 'New email and current password are required' });
    }

    // Verify current user
    const [user] = await query('SELECT auth_id, password_hash, role FROM profiles WHERE auth_id = ?', [decoded.authId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password verification failed' });
    }

    // Check if new email is already in use by another account
    const [existing] = await query('SELECT auth_id FROM profiles WHERE email = ? AND auth_id != ?', [newEmail, decoded.authId]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
    }

    // Update profiles table
    await query('UPDATE profiles SET email = ?, updated_at = NOW() WHERE auth_id = ?', [newEmail, decoded.authId]);

    // Update role tables if applicable
    if (user.role === 'patient') {
      await query('UPDATE patients SET email = ?, updated_at = NOW() WHERE auth_id = ?', [newEmail, decoded.authId]);
    } else if (user.role === 'medic') {
      await query('UPDATE medics SET email = ?, updated_at = NOW() WHERE auth_id = ?', [newEmail, decoded.authId]);
    }

    res.json({
      success: true,
      message: 'Login credentials (email) updated successfully by account owner!',
      email: newEmail
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ success: false, message: 'Failed to update credentials', error: error.message });
  }
});

// Update owner personal profile details
router.put('/profile/details', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const { fullName, phone, specialization, hospitalAffiliation, bloodGroup, dob, gender } = req.body;

    const [user] = await query('SELECT role FROM profiles WHERE auth_id = ?', [decoded.authId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (user.role === 'patient') {
      await query(
        `UPDATE patients SET 
          full_name = COALESCE(?, full_name),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          blood_group = COALESCE(?, blood_group),
          updated_at = NOW()
         WHERE auth_id = ?`,
        [fullName, dob, gender, bloodGroup, decoded.authId]
      );
    } else if (user.role === 'medic') {
      await query(
        `UPDATE medics SET 
          full_name = COALESCE(?, full_name),
          specialization = COALESCE(?, specialization),
          hospital_affiliation = COALESCE(?, hospital_affiliation),
          updated_at = NOW()
         WHERE auth_id = ?`,
        [fullName, specialization, hospitalAffiliation, decoded.authId]
      );
    } else if (user.role === 'admin') {
      await query(
        `UPDATE admin_settings SET 
          full_name = COALESCE(?, full_name),
          updated_at = NOW()
         WHERE auth_id = ?`,
        [fullName, decoded.authId]
      );
    }

    res.json({
      success: true,
      message: 'Personal profile information updated successfully!'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

export default router;

