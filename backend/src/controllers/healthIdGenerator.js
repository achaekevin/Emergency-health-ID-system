import express from "express";
import mongoose from "mongoose";
import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Medic from "../models/Medic.js";

const router = express.Router();

/**
 * Helper: get medicId from header or body
 */
const getMedicId = (req) => req.header("x-medic-id") || req.body.medic;

/**
 * GET /api/records
 * Fetch all records (for admin or medic dashboards)
 */
router.get("/", async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("patient medic", "-__v -medicalRecords -nationalId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "All records fetched",
      count: records.length,
      data: records,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/records
 * Create a medical record (medic-only)
 * Supports patient authId
 */
router.post("/", async (req, res) => {
  try {
    const { authId, diagnosis, treatment, prescriptions, visitDate, notes } = req.body;
    const medicId = getMedicId(req);

    if (!authId || !medicId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "authId, medic, and diagnosis are required",
      });
    }

    // Find patient by authId
    const patient = await Patient.findOne({ authId });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // Validate medic ID
    if (!mongoose.Types.ObjectId.isValid(medicId)) {
      return res.status(400).json({ success: false, message: "Invalid medic ID" });
    }

    const medic = await Medic.findById(medicId);
    if (!medic) return res.status(404).json({ success: false, message: "Medic not found" });

    // Create medical record
    const record = new MedicalRecord({
      patient: patient._id, // ✅ Use ObjectId
      medic: medic._id,
      diagnosis,
      treatment,
      prescriptions,
      visitDate,
      notes,
    });
    await record.save();

    // Link to patient's medicalRecords array
    await Patient.findByIdAndUpdate(patient._id, { $push: { medicalRecords: record._id } });

    res.status(201).json({ success: true, message: "Medical record created", data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/records/patient/:authId
 * Fetch all records for a patient using authId
 */
router.get("/patient/:authId", async (req, res) => {
  try {
    const { authId } = req.params;
    if (!authId) return res.status(400).json({ success: false, message: "authId is required" });

    const patient = await Patient.findOne({ authId });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const records = await MedicalRecord.find({ patient: patient._id })
      .populate("medic", "-__v")
      .sort({ visitDate: -1 });

    res.json({ success: true, message: "Records fetched", count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/records/:id
 * Fetch single record by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid record ID" });

    const record = await MedicalRecord.findById(id).populate("patient medic", "-__v -medicalRecords -nationalId");
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({ success: true, message: "Record fetched", data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/records/:id
 * Update record (medic-only)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medicId = getMedicId(req);
    if (!medicId) return res.status(401).json({ success: false, message: "Medic ID required" });

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid record ID" });

    const record = await MedicalRecord.findById(id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (record.medic.toString() !== medicId.toString()) {
      return res.status(403).json({ success: false, message: "Only the creating medic can update this record" });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: "Record updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/records/:id
 * Delete record (medic-only)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medicId = getMedicId(req);
    if (!medicId) return res.status(401).json({ success: false, message: "Medic ID required" });

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid record ID" });

    const record = await MedicalRecord.findById(id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (record.medic.toString() !== medicId.toString()) {
      return res.status(403).json({ success: false, message: "Only the creating medic can delete this record" });
    }

    await MedicalRecord.findByIdAndDelete(id);
    await Patient.findByIdAndUpdate(record.patient, { $pull: { medicalRecords: record._id } });

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
