// src/models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    authId: { type: String, required: true, unique: true }, // Supabase UID
    email: { type: String, required: true, unique: true },
    fullName: { type: String },
    role: {
      type: String,
      enum: ["patient", "medic", "admin"],
      default: "patient",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
