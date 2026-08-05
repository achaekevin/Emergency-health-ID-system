import bcrypt from 'bcryptjs';
import { query, connectDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding test users...\n');

    // Initialize database connection
    await connectDB();
    console.log('✅ Database connected\n');

    // Default password for all test users
    const defaultPassword = 'Password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Check if users already exist
    const [existingAdmin] = await query('SELECT id FROM profiles WHERE email = ?', ['admin@edhis.com']);
    const [existingPatient] = await query('SELECT id FROM profiles WHERE email = ?', ['patient@test.com']);
    const [existingMedic] = await query('SELECT id FROM profiles WHERE email = ?', ['medic@test.com']);

    // 1. Create Admin User
    if (!existingAdmin) {
      console.log('Creating Admin user...');
      await query(
        `INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        ['auth_admin_001', 'admin', 'admin@edhis.com', hashedPassword]
      );
    }
    const [adminSetting] = await query('SELECT id FROM admin_settings WHERE auth_id = ?', ['auth_admin_001']);
    if (!adminSetting) {
      await query(
        `INSERT INTO admin_settings (auth_id, full_name, permissions, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        ['auth_admin_001', 'System Administrator', 
         JSON.stringify({ canManageUsers: true, canViewAnalytics: true, canModifySettings: true })]
      );
      console.log('✅ Admin user & settings created: admin@edhis.com');
    }

    // 2. Create Test Patient
    if (!existingPatient) {
      console.log('\nCreating Patient user...');
      await query(
        `INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        ['auth_patient_001', 'patient', 'patient@test.com', hashedPassword]
      );
    }
    const [patientRow] = await query('SELECT id FROM patients WHERE auth_id = ?', ['auth_patient_001']);
    if (!patientRow) {
      await query(
        `INSERT INTO patients (
          auth_id, health_id, full_name, date_of_birth, age, gender, blood_group,
          medical_conditions, allergies, current_medications, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'auth_patient_001',
          'EMH-100001',
          'John Doe',
          '1990-05-15',
          34,
          'Male',
          'A+',
          JSON.stringify(['Diabetes Type 2', 'Hypertension']),
          JSON.stringify(['Penicillin', 'Peanuts']),
          JSON.stringify(['Metformin 500mg', 'Lisinopril 10mg']),
          true
        ]
      );
      console.log('✅ Patient user details created: patient@test.com (EMH-100001)');
    }

    // 3. Create Test Medic
    if (!existingMedic) {
      console.log('\nCreating Medic user...');
      await query(
        `INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        ['auth_medic_001', 'medic', 'medic@test.com', hashedPassword]
      );
    }
    const [medicRow] = await query('SELECT id FROM medics WHERE auth_id = ?', ['auth_medic_001']);
    if (!medicRow) {
      await query(
        `INSERT INTO medics (
          auth_id, full_name, email, specialization, license_number, qualification,
          experience_years, hospital_affiliation, is_verified, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'auth_medic_001',
          'Dr. Sarah Johnson',
          'medic@test.com',
          'Emergency Medicine',
          'MED-2024-12345',
          'MD, MBBS',
          10,
          'City General Hospital',
          true,
          true
        ]
      );
      console.log('✅ Medic user details created: medic@test.com');
    }

    // 4. Create Additional Test Patient
    const [existingJane] = await query('SELECT id FROM profiles WHERE email = ?', ['jane@test.com']);
    if (!existingJane) {
      console.log('\nCreating additional Patient user...');
      await query(
        `INSERT INTO profiles (auth_id, role, email, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        ['auth_patient_002', 'patient', 'jane@test.com', hashedPassword]
      );
    }
    const [janeRow] = await query('SELECT id FROM patients WHERE auth_id = ?', ['auth_patient_002']);
    if (!janeRow) {
      await query(
        `INSERT INTO patients (
          auth_id, health_id, full_name, date_of_birth, age, gender, blood_group,
          medical_conditions, allergies, current_medications, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'auth_patient_002',
          'EMH-100002',
          'Jane Smith',
          '1985-08-22',
          39,
          'Female',
          'O-',
          JSON.stringify(['Asthma']),
          JSON.stringify(['Latex', 'Sulfa drugs']),
          JSON.stringify(['Albuterol Inhaler']),
          true
        ]
      );
      console.log('✅ Patient user details created: jane@test.com (EMH-100002)');
    }

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST USER CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\n🔐 All users have the same password: Password123\n');
    console.log('👤 ADMIN:');
    console.log('   Email: admin@edhis.com');
    console.log('   Role: Administrator');
    console.log('   Access: Full system access\n');
    
    console.log('🏥 MEDIC (Medical Professional):');
    console.log('   Email: medic@test.com');
    console.log('   Name: Dr. Sarah Johnson');
    console.log('   Specialization: Emergency Medicine');
    console.log('   License: MED-2024-12345\n');
    
    console.log('🙍 PATIENTS:');
    console.log('   1. Email: patient@test.com');
    console.log('      Name: John Doe');
    console.log('      Health ID: EMH-100001');
    console.log('      Blood Group: A+\n');
    
    console.log('   2. Email: jane@test.com');
    console.log('      Name: Jane Smith');
    console.log('      Health ID: EMH-100002');
    console.log('      Blood Group: O-\n');
    
    console.log('='.repeat(60));
    console.log('✅ Database seeding completed successfully!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
