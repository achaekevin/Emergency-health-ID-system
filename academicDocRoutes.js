import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('EmergencyContact', emergencyContactSchema);
