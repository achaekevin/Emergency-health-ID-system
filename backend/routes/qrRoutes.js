import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get QR data for patient by health_id
router.get('/patient/:healthId', async (req, res) => {
  try {
    const [patient] = await query(
      `SELECT id, health_id, full_name, age, gender, blood_group, medical_conditions, 
              allergies, current_medications, qr_code_data 
       FROM patients WHERE health_id = ?`,
      [req.params.healthId]
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate/Update QR code for patient
router.post('/generate/:patientId', async (req, res) => {
  try {
    const qrData = req.body.qrData || JSON.stringify({ patientId: req.params.patientId });
    
    await query(
      'UPDATE patients SET qr_code_data = ?, qr_code_generated_at = NOW() WHERE id = ?',
      [qrData, req.params.patientId]
    );
    
    res.json({ success: true, message: 'QR code generated successfully', data: { qrData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
