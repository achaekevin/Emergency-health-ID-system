import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get medication logs for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const medications = await query(
      'SELECT * FROM medication_logs WHERE patient_id = ? ORDER BY start_date DESC',
      [req.params.patientId]
    );
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active medications for a patient
router.get('/patient/:patientId/active', async (req, res) => {
  try {
    const medications = await query(
      'SELECT * FROM medication_logs WHERE patient_id = ? AND status = ? ORDER BY start_date DESC',
      [req.params.patientId, 'active']
    );
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create medication log
router.post('/', async (req, res) => {
  try {
    const { patient_id, medic_id, medication_name, dosage, frequency, route, start_date, end_date, purpose, status } = req.body;
    const result = await query(
      `INSERT INTO medication_logs (patient_id, medic_id, medication_name, dosage, frequency, route, start_date, end_date, purpose, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, medic_id || null, medication_name, dosage || null, frequency || null, route || null, start_date, end_date || null, purpose || null, status || 'active']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update medication log
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await query(`UPDATE medication_logs SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Medication log updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete medication log
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM medication_logs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Medication log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
