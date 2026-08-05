import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get full Hospital Directory with GPS and Emergency Hotlines
router.get('/', async (req, res) => {
  try {
    const hospitals = [
      {
        id: 1,
        name: 'City General Hospital',
        address: '100 Medical Center Drive, Suite 10',
        county: 'Central County',
        emergencyNumber: '+1 (555) 911-0100',
        gps: { lat: 40.7128, lng: -74.0060 },
        departments: ['Emergency Room', 'Endocrinology', 'Cardiology', 'ICU', 'Pediatrics'],
        activeMedicsCount: 42
      },
      {
        id: 2,
        name: 'St. Jude Emergency Center',
        address: '450 Healthcare Boulevard',
        county: 'West District',
        emergencyNumber: '+1 (555) 911-0200',
        gps: { lat: 40.7306, lng: -73.9352 },
        departments: ['Trauma Center', 'Orthopedics', 'Neurology', 'Radiology'],
        activeMedicsCount: 28
      }
    ];

    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
