// src/middleware/identifyUser.js - COMPLETELY REPLACE THE FILE
import Patient from "../models/Patient.js";
import Medic from "../models/Medic.js";
import Profile from "../models/Profile.js";

export const identifyUser = async (req, res, next) => {
  try {
    // ✅ SAFE: Extract authId without relying on req.user
    const supabaseId =
      req.headers["x-auth-id"] || 
      req.body?.authId || 
      req.query?.authId;

    if (!supabaseId) {
      req.userType = "unknown";
      req.userRecord = null;
      req.profile = null;
      return next();
    }

    // ✅ Step 2: Find the profile
    const profile = await Profile.findOne({ authId: supabaseId }).lean();
    
    if (!profile) {
      req.userType = "unknown";
      req.userRecord = null;
      req.profile = null;
      return next();
    }

    req.profile = profile;

    // ✅ Step 3: Identify based on stored role
    if (profile.role === "medic") {
      const medic = await Medic.findOne({ authId: supabaseId }).lean();
      req.userType = "medic";
      req.userRecord = medic || null;
      return next();
    }

    if (profile.role === "patient") {
      const patient = await Patient.findOne({ authId: supabaseId }).lean();
      req.userType = "patient";
      req.userRecord = patient || null;
      return next();
    }

    // Default fallback
    req.userType = "unknown";
    req.userRecord = null;
    next();
    
  } catch (err) {
    // Only log critical errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in identifyUser middleware:', err.message);
    }
    next(err);
  }
};