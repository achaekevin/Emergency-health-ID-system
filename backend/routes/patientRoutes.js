import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await query('SELECT * FROM patients WHERE is_active = true LIMIT 50');
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const [patient] = await query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient by auth_id
router.get('/auth/:authId', async (req, res) => {
  try {
    const [patient] = await query('SELECT * FROM patients WHERE auth_id = ?', [req.params.authId]);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const { auth_id, health_id, full_name, email } = req.body;
    const result = await query(
      'INSERT INTO patients (auth_id, health_id, full_name) VALUES (?, ?, ?)',
      [auth_id, health_id, full_name]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await query(`UPDATE patients SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
