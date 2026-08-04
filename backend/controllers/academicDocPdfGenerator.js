import express from "express";
import mongoose from "mongoose";
import EmergencyContact from "../models/EmergencyContact.js";
import Patient from "../models/Patient.js";

const router = express.Router();

/**
 * @route   POST /api/emergency-contacts
 * @desc    Add new emergency contact for a patient
 */
router.post("/", async (req, res) => {
  try {
    const { patient, name, relationship, phone, email, address } = req.body;

    // 🧩 Validate required fields
    if (!patient || !name || !relationship || !phone) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields (patient, name, relationship, phone).",
      });
    }

    // ✅ Validate patient existence
    const existingPatient = await Patient.findById(patient);
    if (!existingPatient) {
      return res.status(404).json({
        status: "error",
        message: "Patient not found. Please verify the patient ID.",
      });
    }

    // 🚫 Prevent duplicate phone numbers for the same patient
    const existingPhone = await EmergencyContact.findOne({
      patient,
      phone,
    });
    if (existingPhone) {
      return res.status(409).json({
        status: "error",
        message: "A contact with this phone number already exists for the patient.",
      });
    }

    // ✅ Create and save new contact
    const newContact = new EmergencyContact({
      patient,
      name,
      relationship,
      phone,
      email,
      address,
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      status: "success",
      message: "Emergency contact added successfully.",
      contact: savedContact,
    });
  } catch (error) {
    console.error("❌ Error creating emergency contact:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while creating contact.",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/emergency-contacts/:patientId
 * @desc    Get all emergency contacts for a specific patient
 */
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid patient ID format.",
      });
    }

    const contacts = await EmergencyContact.find({ patient: patientId });

    if (!contacts.length) {
      return res.status(404).json({
        status: "error",
        message: "No emergency contacts found for this patient.",
      });
    }

    res.status(200).json({
      status: "success",
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching contacts.",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/emergency-contacts/:id
 * @desc    Update an existing emergency contact
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid contact ID format.",
      });
    }

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        status: "error",
        message: "Emergency contact not found.",
      });
    }

    // 🚫 Prevent duplicate phone for the same patient (if phone is being updated)
    if (req.body.phone && req.body.phone !== contact.phone) {
      const duplicate = await EmergencyContact.findOne({
        patient: contact.patient,
        phone: req.body.phone,
      });
      if (duplicate) {
        return res.status(409).json({
          status: "error",
          message: "Another contact with this phone number already exists for this patient.",
        });
      }
    }

    Object.assign(contact, req.body);
    const updatedContact = await contact.save();

    res.status(200).json({
      status: "success",
      message: "Emergency contact updated successfully.",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("❌ Error updating contact:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while updating contact.",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/emergency-contacts/:id
 * @desc    Delete an emergency contact
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid contact ID format.",
      });
    }

    const contact = await EmergencyContact.findById(id);
    if (!contact) {
      return res.status(404).json({
        status: "error",
        message: "Emergency contact not found.",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Emergency contact deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Error deleting contact:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while deleting contact.",
      error: error.message,
    });
  }
});

export default router;
