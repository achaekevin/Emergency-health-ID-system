import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get emergency contacts for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const contacts = await query(
      'SELECT * FROM emergency_contacts WHERE patient_id = ? ORDER BY is_primary DESC, priority ASC',
      [req.params.patientId]
    );
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single emergency contact
router.get('/:id', async (req, res) => {
  try {
    const [contact] = await query('SELECT * FROM emergency_contacts WHERE id = ?', [req.params.id]);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create emergency contact
router.post('/', async (req, res) => {
  try {
    const { patient_id, name, relationship, phone, email, address, is_primary, priority } = req.body;
    const result = await query(
      `INSERT INTO emergency_contacts (patient_id, name, relationship, phone, email, address, is_primary, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, name, relationship, phone, email || null, address || null, is_primary || false, priority || 1]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update emergency contact
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await query(`UPDATE emergency_contacts SET ${fields} WHERE id = ?`, values);
    res.json({ success: true, message: 'Contact updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete emergency contact
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM emergency_contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
