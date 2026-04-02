// src/middleware/auditLogger.js
import AuditLog from "../models/AuditLog.js";

export const logAction = async (req, action, patientId = null) => {
  try {
    await AuditLog.create({
      action,
      userType: req.userType,
      userAuthId: req.profile?.authId || null,
      patient: patientId,
      ip: req.ip,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};
