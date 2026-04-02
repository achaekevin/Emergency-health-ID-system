// src/models/Medic.js
import mongoose from "mongoose";

const medicSchema = new mongoose.Schema(
  {
    authId: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, default: "" },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, default: "" },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    verified: { type: Boolean, default: false } // optional verification flag
  },
  { timestamps: true }
);

// register as "Medic"
const Medic = mongoose.model("Medic", medicSchema);
export default Medic;

