import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const router = express.Router();

// Get system dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [patientCount] = await query('SELECT COUNT(*) as count FROM patients');
    const [medicCount] = await query('SELECT COUNT(*) as count FROM medics');
    const [verifiedMedicCount] = await query('SELECT COUNT(*) as count FROM medics WHERE is_verified = true');
    const [adminCount] = await query("SELECT COUNT(*) as count FROM profiles WHERE role = 'admin'");
    const [scanCount] = await query('SELECT COUNT(*) as count FROM scan_analytics');
    const [recordCount] = await query('SELECT COUNT(*) as count FROM medical_records');
    const [activeUsersCount] = await query('SELECT COUNT(*) as count FROM profiles');

    res.json({
      success: true,
      data: {
        totalPatients: patientCount ? patientCount.count : 0,
        totalMedics: medicCount ? medicCount.count : 0,
        verifiedMedics: verifiedMedicCount ? verifiedMedicCount.count : 0,
        totalAdmins: adminCount ? adminCount.count : 0,
        totalScans: scanCount ? scanCount.count : 0,
        totalMedicalRecords: recordCount ? recordCount.count : 0,
        totalUsers: activeUsersCount ? activeUsersCount.count : 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all system users with role details
router.get('/users', async (req, res) => {
  try {
    const profiles = await query(`
      SELECT 
        p.id as profile_id,
        p.auth_id,
        p.email,
        p.role,
        p.created_at,
        p.updated_at,
        pat.id as patient_id,
        pat.health_id,
        pat.full_name as patient_name,
        pat.is_active as patient_active,
        med.id as medic_id,
        med.full_name as medic_name,
        med.specialization,
        med.license_number,
        med.hospital_affiliation,
        med.is_verified as medic_verified,
        med.is_active as medic_active,
        adm.full_name as admin_name
      FROM profiles p
      LEFT JOIN patients pat ON p.auth_id = pat.auth_id
      LEFT JOIN medics med ON p.auth_id = med.auth_id
      LEFT JOIN admin_settings adm ON p.auth_id = adm.auth_id
      ORDER BY p.created_at DESC
    `);

    const users = profiles.map(u => ({
      authId: u.auth_id,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
      fullName: u.patient_name || u.medic_name || u.admin_name || u.email,
      healthId: u.health_id || null,
      specialization: u.specialization || null,
      licenseNumber: u.license_number || null,
      hospital: u.hospital_affiliation || null,
      isVerified: u.role === 'medic' ? Boolean(u.medic_verified) : true,
      isActive: u.role === 'patient' ? Boolean(u.patient_active) : (u.role === 'medic' ? Boolean(u.medic_active) : true),
      patientId: u.patient_id,
      medicId: u.medic_id
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify/Unverify medic
router.put('/medics/:authId/verify', async (req, res) => {
  try {
    const { authId } = req.params;
    const { isVerified } = req.body;

    await query('UPDATE medics SET is_verified = ? WHERE auth_id = ?', [Boolean(isVerified), authId]);
    res.json({ success: true, message: `Medic verification status updated` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user active status
router.put('/users/:authId/status', async (req, res) => {
  try {
    const { authId } = req.params;
    const { isActive, role } = req.body;

    if (role === 'patient') {
      await query('UPDATE patients SET is_active = ? WHERE auth_id = ?', [Boolean(isActive), authId]);
    } else if (role === 'medic') {
      await query('UPDATE medics SET is_active = ? WHERE auth_id = ?', [Boolean(isActive), authId]);
    }
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50');
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new user (Admin functionality)
router.post('/users', async (req, res) => {
  try {
    const { email, password, fullName, role, specialization, licenseNumber, hospital } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await query('SELECT id FROM profiles WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const authId = `auth_${role}_${Date.now()}`;

    await query(
      'INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [authId, role, cleanEmail, hashedPassword]
    );

    if (role === 'patient') {
      const healthId = `EMH-${Math.floor(100000 + Math.random() * 900000)}`;
      await query(
        `INSERT INTO patients (auth_id, health_id, full_name, email, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [authId, healthId, fullName, cleanEmail]
      );
    } else if (role === 'medic') {
      await query(
        `INSERT INTO medics (auth_id, full_name, email, specialization, license_number, hospital_affiliation, is_verified, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE, NOW(), NOW())`,
        [authId, fullName, cleanEmail, specialization || 'General Practice', licenseNumber || `MED-${Date.now().toString().slice(-5)}`, hospital || 'Emergency Hospital']
      );
    } else if (role === 'admin') {
      await query(
        `INSERT INTO admin_settings (auth_id, full_name, permissions, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [authId, fullName, JSON.stringify({ canManageUsers: true, canViewAnalytics: true, canModifySettings: true })]
      );
    }

    res.status(201).json({ success: true, message: `User ${fullName} created successfully as ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
