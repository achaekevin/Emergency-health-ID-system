const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  FileName: { type: String, required: true },
  fileType: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Document", documentSchema);