const RepairRequest = require('../models/RepairRequest');

exports.assignRequestToMechanic = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { mechanicId } = req.body;

    // Find the repair request by ID
    const repairRequest = await RepairRequest.findById(requestId);
    if (!repairRequest) {
      return res.status(404).json({ error: 'Repair request not found' });
    }

    // Update the request with assigned mechanic and change status
    repairRequest.assignedMechanic = mechanicId;
    repairRequest.status = 'assigned';
    await repairRequest.save();

    res.status(200).json({ 
      message: 'Repair request assigned to mechanic successfully', 
      repairRequest 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign repair request', details: error.message });
  }
};