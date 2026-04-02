// Medication Administration Log Routes
import express from "express";
import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import { identifyUser } from "../middleware/identifyUser.js";
import { requireRole } from "../middleware/requireRole.js";
import { logAction } from "../middleware/auditLogger.js";

const router = express.Router();

// Apply identifyUser to all routes
router.use(identifyUser);

/**
 * @route   POST /api/medication-log
 * @desc    Log medication administration
 * @access  Private (medic/admin only)
 */
router.post("/", requireRole(["medic", "admin"]), async (req, res) => {
  try {
    const { patientId, medication, dosage, route, administeredBy, notes, timestamp } = req.body;

    if (!patientId || !medication || !administeredBy) {
      return res.status(400).json({
        success: false,
        message: "patientId, medication, and administeredBy are required"
      });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Create medication log entry
    const medicationLog = {
      patient: patientId,
      medic: req.userRecord?._id || req.profile?.authId,
      medication,
      dosage: dosage || "N/A",
      route: route || "oral", // oral, IV, IM, etc.
      administeredBy,
      administeredAt: timestamp ? new Date(timestamp) : new Date(),
      notes: notes || "",
      status: "completed"
    };

    // Create medical record entry
    const medicalRecord = new MedicalRecord({
      patient: patientId,
      medic: medicationLog.medic,
      diagnosis: `Medication Administration: ${medication}`,
      department: "Emergency",
      visitDate: medicationLog.administeredAt,
      status: "completed",
      prescriptions: [medication],
      notes: `Medication: ${medication}${dosage ? ` (${dosage})` : ''}${route ? ` via ${route}` : ''}${notes ? ` - ${notes}` : ''}`
    });

    await medicalRecord.save();
    await logAction(req, "MEDICATION_ADMINISTERED", patientId);

    res.status(201).json({
      success: true,
      message: "Medication administration logged successfully",
      data: {
        medicationLog,
        medicalRecord: medicalRecord._id
      }
    });
  } catch (err) {
    console.error("Medication log error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to log medication administration",
      error: err.message
    });
  }
});

/**
 * @route   GET /api/medication-log/patient/:patientId
 * @desc    Get medication administration history for a patient
 * @access  Private (medic/admin/patient)
 */
router.get("/patient/:patientId", requireRole(["patient", "medic", "admin"]), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access permissions
    if (req.userType === "patient" && req.profile?.authId !== patientId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own medication history"
      });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Get medication administration records
    const records = await MedicalRecord.find({
      patient: patientId,
      diagnosis: { $regex: /Medication Administration/i }
    })
      .sort({ visitDate: -1 })
      .populate("medic", "name email")
      .limit(50);

    await logAction(req, "VIEW_MEDICATION_HISTORY", patientId);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error("Get medication history error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medication history",
      error: err.message
    });
  }
});

/**
 * @route   GET /api/medication-log
 * @desc    Get all medication logs (for medic/admin)
 * @access  Private (medic/admin only)
 */
router.get("/", requireRole(["medic", "admin"]), async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      diagnosis: { $regex: /Medication Administration/i }
    })
      .sort({ visitDate: -1 })
      .populate("patient", "basicInfo.fullName basicInfo.bloodGroup")
      .populate("medic", "name email")
      .limit(100);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error("Get all medication logs error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medication logs",
      error: err.message
    });
  }
});

export default router;

