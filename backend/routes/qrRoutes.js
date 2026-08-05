import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get QR data for patient by health_id
router.get('/patient/:healthId', async (req, res) => {
  try {
    const rawId = req.params.healthId ? req.params.healthId.trim() : '';

    const [patient] = await query(
      `SELECT id, auth_id, health_id, full_name, age, gender, blood_group, medical_conditions, 
              allergies, current_medications, qr_code_data 
       FROM patients WHERE UPPER(TRIM(health_id)) = UPPER(TRIM(?))`,
      [rawId]
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: `Patient with Health ID "${rawId}" not found` });
    }
    
    // Safely parse JSON arrays if stored as JSON strings
    let medicalConditions = patient.medical_conditions;
    let allergies = patient.allergies;
    let currentMedications = patient.current_medications;

    try { if (typeof medicalConditions === 'string') medicalConditions = JSON.parse(medicalConditions); } catch(e) {}
    try { if (typeof allergies === 'string') allergies = JSON.parse(allergies); } catch(e) {}
    try { if (typeof currentMedications === 'string') currentMedications = JSON.parse(currentMedications); } catch(e) {}

    // Fetch emergency contacts for this patient
    const contacts = await query(
      'SELECT * FROM emergency_contacts WHERE patient_id = ? ORDER BY is_primary DESC, priority ASC',
      [patient.id]
    );

    res.json({
      success: true,
      data: {
        ...patient,
        medical_conditions: medicalConditions,
        allergies: allergies,
        current_medications: currentMedications,
        emergency_contacts: contacts || []
      }
    });
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
