import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import qrRoutes from './routes/qrRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import emergencyContactRoutes from './routes/emergencyContactRoutes.js';
import medicRoutes from './routes/medicRoutes.js';
import analyticRoutes from './routes/AnalyticRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import medicationLogRoutes from './routes/medicationLogRoutes.js';
import academicDocRoutes from './routes/academicDocRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import consentRoutes from './routes/consentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io')) {
      return callback(null, true);
    }

    if (process.env.VERCEL === '1' && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-id', 'Cache-Control']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medics', medicRoutes);
app.use('/api/records', medicalRecordRoutes);
app.use('/api/medication-log', medicationLogRoutes);
app.use('/api/academic-docs', academicDocRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/appointments', appointmentRoutes);


// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Emergency Health ID API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
