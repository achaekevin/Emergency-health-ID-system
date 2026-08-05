import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, doctor: 'Dr. Sarah Johnson', patient: 'John Doe', healthId: 'EMH-100001', facility: 'City General Hospital', department: 'Endocrinology', date: '2026-08-06', time: '10:00 AM', status: 'Scheduled' }
    ]
  });
});

router.post('/', async (req, res) => {
  res.json({
    success: true,
    message: 'Appointment successfully created',
    data: { id: Date.now(), ...req.body, status: 'Scheduled' }
  });
});

export default router;
