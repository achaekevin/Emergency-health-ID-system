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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const [user] = await query(
      'SELECT * FROM profiles WHERE email = ?',
      [email]
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
    let fullName = email;
    let profileId = null;

    if (user.role === 'patient') {
      const [patient] = await query(
        'SELECT id, full_name FROM patients WHERE auth_id = ?',
        [user.auth_id]
      );
      if (patient) {
        fullName = patient.full_name;
        profileId = patient.id;
      }
    } else if (user.role === 'medic') {
      const [medic] = await query(
        'SELECT id, full_name FROM medics WHERE auth_id = ?',
        [user.auth_id]
      );
      if (medic) {
        fullName = medic.full_name;
        profileId = medic.id;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { authId: user.auth_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, user_type, action, status, ip_address, timestamp)
       VALUES (?, ?, 'login', 'success', ?, NOW())`,
      [user.auth_id, user.role, req.ip]
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        authId: user.auth_id,
        email: user.email,
        fullName,
        role: user.role,
        profileId
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

export default router;
