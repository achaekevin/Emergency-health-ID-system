/**
 * Generate a unique Health ID for patients
 * Format: EMH-XXXXXX (Emergency Medical Health - 6 digits)
 * Example: EMH-123456
 */

import Patient from "../models/Patient.js";

/**
 * Generate a random 6-digit number
 */
const generateRandomDigits = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a unique Health ID
 * @returns {Promise<string>} Unique Health ID in format EMH-XXXXXX
 */
export const generateHealthId = async () => {
  let healthId;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    const digits = generateRandomDigits();
    healthId = `EMH-${digits}`;
    
    // Check if this ID already exists
    const existing = await Patient.findOne({ healthId });
    
    if (!existing) {
      return healthId;
    }
    
    attempts++;
    
    // If we've tried too many times, use timestamp-based approach
    if (attempts >= maxAttempts) {
      const timestamp = Date.now().toString().slice(-6);
      healthId = `EMH-${timestamp}`;
      const stillExists = await Patient.findOne({ healthId });
      if (!stillExists) {
        return healthId;
      }
      // Last resort: add random suffix
      healthId = `EMH-${timestamp}${Math.floor(Math.random() * 100)}`;
      return healthId;
    }
  } while (attempts < maxAttempts);

  // Fallback (should never reach here)
  return `EMH-${Date.now().toString().slice(-6)}`;
};

