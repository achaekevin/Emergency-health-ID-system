// src/routes/doctorRoutes.js
import express from "express";
import Medic from "../models/Medic.js";

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Register a new doctor
 */
router.post("/", async (req, res) => {
  try {
    const doctor = new Medic(req.body);
    await doctor.save();
    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      data: doctor,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to register doctor",
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 */
router.get("/", async (req, res) => {
  try {
    const doctors = await Medic.find();
    res.json({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Medic.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.json({
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: err.message,
    });
  }
});

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedDoctor = await Medic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update doctor",
      error: err.message,
    });
  }
});

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete doctor
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedDoctor = await Medic.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: err.message,
    });
  }
});

export default router;
