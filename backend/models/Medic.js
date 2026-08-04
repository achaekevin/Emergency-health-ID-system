// src/middleware/requireRole.js
/**
 * requireRole('medic') or requireRole(['medic','admin'])
 */
export const requireRole = (allowed) => {
  const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
  return (req, res, next) => {
    if (!req.userType || req.userType === "unknown") {
      return res.status(401).json({ success: false, message: "Unauthorized: user not identified" });
    }
    if (!allowedArr.includes(req.userType)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};
