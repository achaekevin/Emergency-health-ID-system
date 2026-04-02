/**
 * Script to fix qrCodeId unique index issue
 * 
 * IMPORTANT: This script does NOT delete any patient documents.
 * It only:
 * 1. Drops the existing non-sparse unique index on qrMetadata.qrCodeId
 * 2. Creates a new sparse unique index (allows multiple null values)
 * 
 * The sparse index allows multiple patients to have null qrCodeId without errors.
 * No patient data is modified or deleted.
 */

import dotenv from "dotenv";
import Patient from "../models/Patient.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const fixQrCodeIdIndex = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");
    console.log("ℹ️  This script will NOT delete or modify any patient documents.");
    console.log("ℹ️  It only fixes the database index to allow multiple null qrCodeId values.\n");

    // Step 1: Check for existing patients with null qrCodeId (for info only)
    const patientsWithNullQrCodeId = await Patient.countDocuments({
      "qrMetadata.qrCodeId": null
    });
    console.log(`📋 Found ${patientsWithNullQrCodeId} patients with null qrCodeId (this is OK with sparse index)`);

    // Step 2: Drop existing index if it exists
    try {
      await Patient.collection.dropIndex("qrMetadata.qrCodeId_1");
      console.log("✅ Dropped existing qrCodeId index");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  Index doesn't exist, will create new one");
      } else {
        console.log("⚠️  Error dropping index (may not exist):", error.message);
      }
    }

    // Step 3: Create new sparse unique index
    // Sparse index allows multiple null values, which fixes the duplicate key error
    try {
      await Patient.collection.createIndex(
        { "qrMetadata.qrCodeId": 1 },
        { unique: true, sparse: true, name: "qrMetadata.qrCodeId_1" }
      );
      console.log("✅ Created new sparse unique index on qrMetadata.qrCodeId");
      console.log("ℹ️  Sparse index allows multiple null values - no more duplicate key errors!");
    } catch (error) {
      console.error("❌ Error creating index:", error.message);
      throw error;
    }

    console.log("\n✅ Script completed successfully!");
    console.log("✅ All patient documents are safe and unchanged.");
    console.log("✅ New patients can now be created without qrCodeId errors.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
};

// Run the script
fixQrCodeIdIndex();

