# Emergency Health ID System

The Emergency Health ID System (EDHIS) is a digital health identification platform designed to assist in emergency medical situations. The platform provides emergency responders and healthcare professionals with immediate access to essential patient data through QR code scanning and Health ID lookups, supporting informed triage and care decisions.

---

## System Overview

In emergency care, rapid access to patient medical background is vital. The Emergency Health ID System allows patients to store critical medical attributes—including blood group, severe allergies, chronic conditions, active medications, and designated emergency contacts. First responders and medical personnel can scan a patient's digital Health ID QR card or query their unique Health ID to retrieve these records instantly.

---

## Key Features

### Patient Dashboard
* Digital Emergency Health ID card with unique QR code generation.
* Real-time management of medical conditions, severe allergies, and vitals.
* Emergency contact management with primary and secondary priority designations.
* Medication tracking for active prescriptions and dosage schedules.
* Medical record history displaying clinical encounters, diagnoses, and healthcare facilities.

### Medical Professional Dashboard
* Integrated camera scanner, image file upload reader, and manual Health ID lookup.
* High-contrast emergency triage modal displaying blood group, allergies, conditions, and emergency contact details.
* Clinical encounter recorder for adding diagnoses, treatments, and prescriptions directly to patient charts.
* Practice analytics tracking total scans, critical cases triaged, and average response times.

### System Administrator Dashboard
* Key system performance indicators including total registered patients, verified medical professionals, and scan logs.
* User management interface supporting role filtering, search, user status toggles, medical license verification, and account creation.
* Real-time security audit log tracking user authentication, scanning events, and system changes.

---

## Technology Stack

### Frontend
* React with Vite for component architecture and development performance.
* Redux Toolkit for centralized state management.
* React Router for role-gated navigation and access control.
* HTML5-QRCode for camera video scanning and image file QR code decoding.
* QRCode.React for SVG QR code rendering.
* Custom CSS design system.

### Backend
* Node.js and Express framework for the RESTful API server.
* MySQL database with mysql2 connection pooling for relational data storage.
* Bcrypt.js for password hashing.
* JSON Web Tokens (JWT) for session management and authorization.

---

## Database Architecture

The system utilizes a MySQL relational database structure to maintain data integrity and support complex relationships across user roles and medical records.

### Primary Tables
* `profiles`: User authentication accounts, roles, and credentials.
* `patients`: Detailed patient demographic and medical profile records.
* `medics`: Healthcare professional credentials, license details, and hospital affiliations.
* `admin_settings`: System administrator permissions and configuration preferences.
* `medical_records`: Historical patient clinical encounters and medical reports.
* `medication_logs`: Active prescription and dosage tracking records.
* `emergency_contacts`: Primary and secondary emergency contact details.
* `scan_analytics`: Emergency encounter scan logs, response metrics, and severity scores.
* `audit_logs`: Security and access audit trails.

---

## Project Structure

```
Emergency-health-ID-system/
├── backend/
│   ├── app.js                     # Express application setup
│   ├── index.js                   # Server entry point
│   ├── config/
│   │   └── db.js                  # MySQL database connection configuration
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication and profile endpoints
│   │   ├── adminRoutes.js         # Administration and user management endpoints
│   │   ├── patientRoutes.js       # Patient data management
│   │   ├── medicRoutes.js         # Medical professional data management
│   │   ├── medicalRecordRoutes.js # Clinical records management
│   │   ├── medicationLogRoutes.js # Medication tracking management
│   │   ├── emergencyContactRoutes.js # Emergency contact management
│   │   ├── qrRoutes.js            # QR code data lookup endpoints
│   │   └── AnalyticRoutes.js      # Practice and system analytics endpoints
│   └── scripts/
│       └── seedUsers.js           # Database seeder script
│
└── frontend/
    ├── src/
    │   ├── App.jsx                 # Main application router and guards
    │   ├── main.jsx                # Application entry point
    │   ├── index.css               # Global application styles
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header navigation component
    │   │   ├── Login.jsx           # User authentication interface
    │   │   ├── Register.jsx        # Account registration interface
    │   │   ├── PatientDashboard.jsx# Patient management portal
    │   │   ├── MedicDashboard.jsx  # Healthcare provider portal
    │   │   ├── AdminDashboard.jsx  # System administrator portal
    │   │   ├── HealthIDCard.jsx    # Digital ID card and QR display
    │   │   ├── QRScanner.jsx       # QR scanning interface
    │   │   └── QRScannerModal.jsx  # Scanner modal wrapper
    │   └── redux/
    │       └── authSlice.js        # Authentication state store
    └── package.json
```
