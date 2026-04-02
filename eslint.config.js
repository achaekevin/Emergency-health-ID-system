/**
 * Script to add Health IDs to existing patients who don't have one
 * Run with: node backend/src/scripts/addHealthIds.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "../models/Patient.js";
import { generateHealthId } from "../utils/healthIdGenerator.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const addHealthIdsToPatients = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");

    // Find all patients without healthId
    const patientsWithoutHealthId = await Patient.find({ 
      $or: [
        { healthId: { $exists: false } },
        { healthId: null },
        { healthId: "" }
      ]
    });

    console.log(`📋 Found ${patientsWithoutHealthId.length} patients without Health ID`);

    if (patientsWithoutHealthId.length === 0) {
      console.log("✅ All patients already have Health IDs");
      process.exit(0);
    }

    // Generate and assign Health IDs
    let updated = 0;
    let errors = 0;

    for (const patient of patientsWithoutHealthId) {
      try {
        const healthId = await generateHealthId();
        patient.healthId = healthId;
        await patient.save();
        
        console.log(`✅ Assigned ${healthId} to ${patient.basicInfo?.fullName || patient.authId}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error assigning Health ID to ${patient.authId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Completed: ${updated} patients updated, ${errors} errors`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
};

// Run the script
addHealthIdsToPatients();

