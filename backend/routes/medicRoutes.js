import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all medics
router.get('/', async (req, res) => {
  try {
    const medics = await query('SELECT * FROM medics WHERE is_active = true LIMIT 50');
    res.json({ success: true, data: medics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get medic by ID
router.get('/:id', async (req, res) => {
  try {
    const [medic] = await query('SELECT * FROM medics WHERE id = ?', [req.params.id]);
    if (!medic) {
      return res.status(404).json({ success: false, message: 'Medic not found' });
    }
    res.json({ success: true, data: medic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get medic by auth_id
router.get('/auth/:authId', async (req, res) => {
  try {
    const [medic] = await query('SELECT * FROM medics WHERE auth_id = ?', [req.params.authId]);
    if (!medic) {
      return res.status(404).json({ success: false, message: 'Medic not found' });
    }
    res.json({ success: true, data: medic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create medic
router.post('/', async (req, res) => {
  try {
    const { auth_id, full_name, email, specialization, license_number } = req.body;
    const result = await query(
      'INSERT INTO medics (auth_id, full_name, email, specialization, license_number) VALUES (?, ?, ?, ?, ?)',
      [auth_id, full_name, email, specialization, license_number]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update medic
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await query(`UPDATE medics SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Medic updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
