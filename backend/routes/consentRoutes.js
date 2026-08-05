import express from 'express';

const router = express.Router();

// Get patient consent configuration
router.get('/:patientId', async (req, res) => {
  res.json({
    success: true,
    data: {
      accessMode: 'All Registered Medics', // 'All Registered Medics' | 'Emergency Access Only' | 'Hospital Whitelist'
      temporaryTokenActive: true,
      tokenExpiresAt: '2026-08-06 09:30 EST',
      whitelistedHospitals: ['City General Hospital', 'St. Jude ER'],
      revokedMedics: []
    }
  });
});

// Update patient consent configuration
router.put('/:patientId', async (req, res) => {
  const { accessMode, whitelistedHospitals } = req.body;
  res.json({
    success: true,
    message: `Consent settings updated to access mode: ${accessMode}`,
    data: { accessMode, whitelistedHospitals }
  });
});

export default router;
