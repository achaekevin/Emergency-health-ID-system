import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    // Linked patient
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Linked medic
    medic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medic",
      required: true,
    },

    // Medical record details
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "General Medicine",
      trim: true,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
      lowercase: true,
    },

    prescriptions: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
