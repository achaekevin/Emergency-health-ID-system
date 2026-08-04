# Emergency Health ID System

A comprehensive digital health identification platform designed for emergency medical situations. The system enables medical professionals to quickly access critical patient information through QR code scanning, facilitating faster and more informed emergency care decisions.

## Overview

The Emergency Health ID System bridges the gap between patients and emergency responders by providing instant access to vital medical information when every second counts. Patients maintain their health profiles with critical details like allergies, medications, blood type, and emergency contacts, while medical professionals can scan QR codes to retrieve this information in real-time during emergencies.

## Core Features

### Patient Management
- Digital health ID cards with unique QR codes for quick identification
- Comprehensive medical profile management including conditions, allergies, medications, and vitals
- Emergency contact storage with priority designation
- Secure profile updates and data management
- Health vitals tracking including blood pressure, heart rate, oxygen levels, and temperature
- Medical document storage and access

### Medical Professional Dashboard
- QR code scanning for instant patient information retrieval
- Real-time access to patient medical history and critical conditions
- Recent scan history and patient encounter logs
- Analytics dashboard showing scan patterns, peak hours, and emergency trends
- Blood type distribution tracking
- Common medical condition and allergy analytics
- Performance metrics including response times and case severity tracking

### Authentication and Security
- Supabase-powered authentication system
- Role-based access control for patients and medical professionals
- Secure API endpoints with token verification
- Encrypted QR code generation for patient data
- Audit logging for all data access and modifications
- Rate limiting on critical endpoints

### Analytics and Reporting
- Scan analytics with emergency type classification
- Practice analytics for medical professionals
- Monthly performance summaries
- Alert systems for critical cases
- Predictive analytics for patient volume and emergency probability
- Real-time system performance monitoring
- Patient activity tracking and medic performance evaluation

## Technology Stack

### Frontend
- React with modern hooks-based architecture
- Redux for state management
- Material-UI icons for consistent interface
- CSS Modules for component-scoped styling
- Vite for fast development and optimized builds
- React Router for navigation

### Backend
- Node.js with Express framework
- MongoDB for flexible document storage
- Mongoose ODM for data modeling
- Supabase for authentication infrastructure
- QR code generation and encryption
- PDF generation for health ID cards
- Multer for file uploads
- Rate limiting and validation middleware

### Infrastructure
- CORS-enabled API with environment-based configuration
- RESTful API architecture
- Vercel deployment ready
- Environment variable management
- Comprehensive error handling and logging

## Project Structure

```
Emergency-health-ID-system/
├── backend/
│   ├── app.js                     # Express application setup
│   ├── index.js                   # Server entry point
│   ├── config/
│   │   └── db.js                  # Database configuration
│   ├── controllers/
│   │   ├── qrController.js        # QR code generation logic
│   │   ├── healthIdGenerator.js   # Health ID creation
│   │   ├── pdfCardGenerator.js    # PDF card generation
│   │   └── academicDocPdfGenerator.js
│   ├── middleware/
│   │   ├── requireRole.js         # Role-based access control
│   │   ├── validation.js          # Input validation and sanitization
│   │   ├── auditLogger.js         # Activity logging
│   │   └── identifyUser.js        # User identification
│   ├── models/
│   │   ├── Medic.js               # Medical professional schema
│   │   ├── MedicalRecord.js       # Medical record schema
│   │   ├── EmergencyContact.js    # Emergency contact schema
│   │   ├── Document.js            # Document storage schema
│   │   ├── Analytic.js            # Analytics data schema
│   │   ├── AuditLog.js            # Audit trail schema
│   │   ├── Notifications.js       # Notification schema
│   │   └── Profile.js             # Patient profile schema
│   ├── routes/
│   │   ├── qrRoutes.js            # QR and analytics endpoints
│   │   ├── patientRoutes.js       # Patient management
│   │   ├── medicRoutes.js         # Medic management
│   │   ├── emergencyContactRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   ├── medicationLogRoutes.js
│   │   ├── academicDocRoutes.js
│   │   └── AnalyticRoutes.js      # Analytics endpoints
│   ├── tests/
│   │   └── health.test.js         # API health tests
│   └── utils/
│       ├── emergencyUtils.js      # Emergency helper functions
│       ├── addHealthIds.js        # Health ID utilities
│       └── fixQrCodeIdIndex.js    # Data migration scripts
│
└── frontend/
    ├── public/                     # Static assets
    ├── src/
    │   ├── App.jsx                 # Main application component
    │   ├── main.jsx                # Application entry point
    │   ├── index.css               # Global styles
    │   ├── components/
    │   │   ├── PatientDashboard.jsx        # Patient interface
    │   │   ├── MedicDashboard.jsx          # Medic interface
    │   │   ├── HealthIDCard.jsx            # ID card display
    │   │   ├── QRScanner.jsx               # QR scanning interface
    │   │   ├── QRScannerModal.jsx          # Scan modal component
    │   │   ├── EmergencyContacts.jsx       # Contact management
    │   │   ├── EditableHealthVitals.jsx    # Vitals editing
    │   │   ├── EditableEmergencyContacts.jsx
    │   │   ├── EditableBasicInfo.jsx
    │   │   ├── RecentVisits.jsx            # Visit history
    │   │   ├── AnalyticsChart.jsx          # Chart components
    │   │   ├── Documentation.jsx           # Help documentation
    │   │   ├── Login.jsx                   # Authentication
    │   │   ├── Register.jsx                # User registration
    │   │   ├── WelcomeSetup.jsx            # Onboarding flow
    │   │   ├── PatientRouteGuard.jsx       # Route protection
    │   │   └── OAuthCallback.jsx           # OAuth handling
    │   ├── redux/
    │   │   ├── authSlice.js        # Authentication state
    │   │   └── mobileSlice.js      # Mobile view state
    │   └── utils/
    │       ├── apiClient.js        # HTTP client configuration
    │       ├── config.js           # Environment configuration
    │       └── supabaseClient.js   # Supabase client setup
    ├── index.html                  # HTML entry point
    ├── eslint.config.js            # Linting configuration
    └── vercel.json                 # Deployment configuration
```

## API Endpoints

### Patient Endpoints
- Profile management and health information updates
- Emergency contact CRUD operations
- Medical record access and modifications
- Health vitals logging
- Document uploads

### Medical Professional Endpoints
- QR code scanning and data retrieval
- Patient search and lookup
- Analytics dashboard data
- Scan history and logs
- Performance metrics

### Analytics Endpoints
- Scan tracking and statistics
- Practice analytics and summaries
- Monthly performance reports
- Alert management
- Real-time dashboard data
- Blood type distribution
- Common conditions and allergies
- Peak activity hours

## Data Models

The system uses MongoDB with Mongoose schemas for:
- Patient profiles with comprehensive medical information
- Medical professional credentials and practice details
- Emergency contacts with priority levels
- Medical records and documentation
- Scan analytics for emergency encounters
- Audit logs for compliance and security
- Notifications and alerts
- System performance metrics

## Security Features

- JWT-based authentication through Supabase
- Role-based authorization middleware
- Input sanitization and validation
- Rate limiting on sensitive endpoints
- Encrypted QR code data
- CORS configuration for approved origins
- Secure file upload handling
- Audit trail for all critical operations

## Design Philosophy

The system prioritizes speed and accuracy in emergency situations. The interface is designed for quick scanning and immediate information display, with critical data highlighted for rapid assessment. The architecture supports offline QR code generation and cached data to ensure functionality in areas with limited connectivity.
