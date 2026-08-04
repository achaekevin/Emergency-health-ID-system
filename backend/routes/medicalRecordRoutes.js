import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get medical records for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const records = await query(
      'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY date_recorded DESC',
      [req.params.patientId]
    );
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single medical record
router.get('/:id', async (req, res) => {
  try {
    const [record] = await query('SELECT * FROM medical_records WHERE id = ?', [req.params.id]);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create medical record
router.post('/', async (req, res) => {
  try {
    const { patient_id, medic_id, record_type, title, description, diagnosis, treatment, date_recorded, facility } = req.body;
    const result = await query(
      `INSERT INTO medical_records (patient_id, medic_id, record_type, title, description, diagnosis, treatment, date_recorded, facility) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, medic_id || null, record_type, title, description || null, diagnosis || null, treatment || null, date_recorded, facility || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update medical record
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await query(`UPDATE medical_records SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete medical record
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM medical_records WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
