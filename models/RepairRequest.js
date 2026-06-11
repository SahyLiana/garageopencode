const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carName: { type: String, required: true },
  carModel: { type: String, required: true },
  problemDescription: { type: String, required: true },
  images: [{ type: String }], // URLs or paths to uploaded images
  status: { 
    type: String, 
    enum: ['pending', 'assigned', 'in_progress', 'completed'], 
    default: 'pending' 
  },
  assignedMechanic: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RepairRequest', repairRequestSchema);