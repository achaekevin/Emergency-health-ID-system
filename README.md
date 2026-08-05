# Emergency Health ID System (EDHIS)

The **Emergency Health ID System (EDHIS)** is a production-ready digital health identification platform designed for rapid emergency medical response, clinical care continuity, and platform governance.

---

## Key System Features (20 Comprehensive Modules)

### 1. Emergency Mode (Highest Priority Unauthenticated Triage)
- Immediate life-saving data display (`/emergency/:healthId`) requiring no login.
- Displays: Blood group, Severe allergies, Chronic conditions, Active medications, Emergency contacts, Organ donor status, and DNR (Do Not Resuscitate) status indicator.
- Audit Logging: Every access automatically logs GPS coordinates (`lat/lng`), timestamp, user device, attending medic, hospital, and access reason into `audit_logs` & `scan_analytics`.

### 2. Offline Emergency QR Code
- Embedded Base64 encrypted JSON payload (`EMH_ENC:v1:...`) formatted directly into the QR code SVG.
- Enables camera scanners to decode critical emergency vitals (Blood group, allergies, conditions, primary contact) even when internet connectivity is completely offline.

### 3. Patient Consent Management
- Granular consent controls:
  - All Licensed Medical Professionals
  - Emergency Triage Access Only
  - Whitelisted Hospitals Only
  - Temporary 24-Hour Access Tokens (auto-expiring)
  - Instant Permission Revocation.

### 4. Prominent Medical Alerts
- High-visibility animated badge cards displayed post-scan for high-risk flags:
  - Diabetic, Epileptic, Asthmatic, Heart Disease / Pacemaker, Pregnancy, Kidney Disease.

### 5. Hospital Directory
- Registered hospitals with Street Address, County, Emergency Hotline (`tel:` calling), GPS Coordinates (`lat/lng`), and Departments list (ER, ICU, Cardiology, Radiology).
- Medical professionals are directly linked to hospital directory records.

### 6. Practitioner Verification Workflow
- Multi-step onboarding: Registration -> Upload License, Government ID, Hospital ID -> Status: Pending Verification.
- Admin Verification Center allows reviewing document attachments, verifying license numbers, approving/rejecting registrations, and notifying applicants.

### 7. Secure Medical Document & Imaging Repository
- Encrypted repository supporting X-Rays, MRI Scans, CT Scans, ECG Reports, Lab Reports, Discharge Summaries, and Referral Letters.
- Built-in previewer for PDF documents and high-resolution diagnostic images.

### 8. Interactive Medical History Timeline (`MedicalTimeline.jsx`)
- Visual care pathway rendering patient encounters in a chronological flow:
  Emergency Visit -> Diagnosis -> Prescriptions -> Follow-Up -> Lab Results -> Discharge.

### 9. Multi-Role Notification System
- Real-time and persistent notification queue tailored per role:
  - Patients: Medication reminders, prescription updates, record access alerts, appointment notifications.
  - Medics: New ER triage cases, verification status updates, license expiry alerts.
  - Admins: Failed login alerts, system errors, pending approvals queue, backup status.

### 10. Role-Based Dashboard Analytics
- Patient: Hospital visit frequency, medication adherence, access history logs.
- Medic: Total patients treated, emergency triage scans, diagnoses recorded, response time averages.
- Admin: Active users, daily/monthly registrations, QR scan volume, system health metrics.

### 11. Multi-Parameter Advanced Search Engine
- Search patient records by: Health ID, National ID, Passport, Phone Number, Full Name, Blood Group, Hospital, or Specific Medical Condition.

### 12. Emergency Contact Verification
- Primary and secondary emergency contact calling with SMS / Email OTP verification status indicators (Verified Contact).

### 13. Clinical Decision Support & Drug Interaction Checker
- Automated clinical alert engine during prescription entry:
  - Detects drug-drug conflicts (e.g., Lisinopril + Potassium Supplements risk).
  - Detects allergy-drug conflicts (e.g., Amoxicillin vs Penicillin Allergy).

### 14. Health Record Versioning
- Immutable version history tracking (Version 1 -> Version 2 -> Version 3) with editor ID, timestamp, and field diff logs.

### 15. Appointment & Follow-Up Module
- Medics can schedule, cancel, or reschedule follow-up appointments.
- Patients can view appointments, confirm attendance, or request rescheduling.

### 16. System-Wide Emergency Broadcasts
- Administrators can dispatch platform announcements, maintenance notices, and public health advisories across all active user screens.

### 17. Unified Activity Center & Access History
- Audit log of which medical professional or hospital viewed patient records, timestamp, date, and access reason.

### 18. Data Exporter
- Export complete patient charts, encounter summaries, and system audit logs in formatted PDF, CSV, and Excel formats.

### 19. Advanced Security Features
- Owner-only self-service profile and credential management (`UserProfileManager.jsx`).
- JWT Refresh tokens, Two-Factor Authentication (2FA), account lockout after 5 failed login attempts, active sessions manager, IP logging, and inactivity auto-logout.

### 20. Production-Ready Architecture
- Modular RESTful Express services, repository data patterns, centralized error handling, and Vite build configuration.

---

## Owner-Only Profile & Credentials Management

Under EDHIS security guidelines:
- Each account owner is the sole authority permitted to modify their personal profile details, login email/username, and password.
- Administrative user tables allow status toggles (Suspend/Activate) and license approvals, but login passwords and email credentials remain protected and editable exclusively by the account owner.

---

## Technology Stack

### Frontend
- Framework: React with Vite (`vite.js`)
- State Management: Redux Toolkit & React-Redux
- Routing: React Router DOM (v6) with Role-Based Route Guards
- QR Engine: `qrcode.react` (SVG Generation) & `html5-qrcode` (Camera Video Scanning & Image Parsing)
- UI System: Modern Vanilla CSS Glassmorphism with CSS Variables

### Backend
- Runtime: Node.js & Express.js (ES Modules)
- Database: MySQL with `mysql2` promise connection pooling
- Security & Auth: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, CORS protection, rate limiting
- File Storage: Static file uploads serving (`/uploads`)

---

## Repository Structure

```
Emergency-health-ID-system/
├── backend/
│   ├── app.js                         # Express server configuration & route mounting
│   ├── index.js                       # Entry point listener
│   ├── config/
│   │   └── db.js                      # MySQL pool configuration
│   ├── routes/
│   │   ├── authRoutes.js              # Auth & owner profile credentials endpoints
│   │   ├── adminRoutes.js             # Platform governance & user management
│   │   ├── patientRoutes.js           # Patient profile endpoints
│   │   ├── medicRoutes.js             # Healthcare professional endpoints
│   │   ├── medicalRecordRoutes.js     # Diagnostic records & versioning
│   │   ├── medicationLogRoutes.js     # Active medication tracking
│   │   ├── emergencyContactRoutes.js  # Emergency contact endpoints
│   │   ├── qrRoutes.js                # Emergency QR scan triage lookup
│   │   ├── hospitalRoutes.js          # Hospital directory & hotline directory
│   │   ├── consentRoutes.js           # Patient consent & permission endpoints
│   │   └── appointmentRoutes.js       # Appointment scheduler endpoints
│   └── scripts/
│       └── seedUsers.js               # Database seeder script
│
└── frontend/
    ├── src/
    │   ├── App.jsx                     # Route guard & role routing
    │   ├── main.jsx                    # Application root
    │   ├── index.css                   # Global CSS design tokens & sidebar styles
    │   ├── components/
    │   │   ├── Navbar.jsx              # Application navigation bar
    │   │   ├── Login.jsx               # Authentication view
    │   │   ├── Register.jsx            # User registration
    │   │   ├── PatientDashboard.jsx    # Patient management portal
    │   │   ├── MedicDashboard.jsx      # Doctor & emergency response portal
    │   │   ├── AdminDashboard.jsx      # Administrator governance portal
    │   │   ├── HealthIDCard.jsx        # Digital Health ID Card & QR rendering
    │   │   ├── QRScannerModal.jsx      # Camera & image QR scanner
    │   │   ├── EmergencyPatientView.jsx# Unauthenticated emergency triage view
    │   │   ├── UserProfileManager.jsx  # Owner profile & credential control
    │   │   ├── MedicalTimeline.jsx     # Chronological care pathway & versioning
    │   │   ├── DocumentRepository.jsx  # Diagnostic imaging & document viewer
    │   │   └── AppointmentModule.jsx   # Clinical appointment scheduler
    │   ├── utils/
    │   │   └── drugInteractionChecker.js # Clinical decision support rule engine
    │   └── redux/
    │       └── authSlice.js            # Authentication state slice
    └── package.json
```
