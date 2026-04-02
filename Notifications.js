// src/middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Sanitize string inputs
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
};

// Sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
};

// Patient validation rules
export const validatePatient = [
  body('basicInfo.fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('basicInfo.age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be a valid number between 0 and 150'),
  body('basicInfo.bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  handleValidationErrors
];

// Health vitals validation
export const validateHealthVitals = [
  body('bloodPressure.systolic')
    .optional()
    .isInt({ min: 50, max: 250 })
    .withMessage('Systolic blood pressure must be between 50 and 250'),
  body('bloodPressure.diastolic')
    .optional()
    .isInt({ min: 30, max: 150 })
    .withMessage('Diastolic blood pressure must be between 30 and 150'),
  body('heartRate.value')
    .optional()
    .isInt({ min: 30, max: 250 })
    .withMessage('Heart rate must be between 30 and 250'),
  body('weight.value')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Weight must be between 1 and 500 kg'),
  body('height')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Height must be between 30 and 300 cm'),
  body('bmi.value')
    .optional()
    .isFloat({ min: 10, max: 70 })
    .withMessage('BMI must be between 10 and 70'),
  handleValidationErrors
];

// Auth ID parameter validation
export const validateAuthId = [
  param('authId')
    .isUUID()
    .withMessage('Invalid authId format'),
  handleValidationErrors
];

// MongoDB ID validation
export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid MongoDB ID format'),
  handleValidationErrors
];

