const RepairRequest = require('../models/RepairRequest');
const path = require('path');
const fs = require('fs');

// Assuming you have an uploads directory for storing images
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

exports.createRepairRequest = async (req, res) => {
  try {
    const { userId, carName, carModel, problemDescription } = req.body;
    // req.files contains uploaded images (if using multer with array)
    const imageFiles = req.files || [];
    const imagePaths = imageFiles.map(file => file.filename); // or path

    const repairRequest = new RepairRequest({
      userId,
      carName,
      carModel,
      problemDescription,
      images: imagePaths,
      status: 'pending'
    });

    await repairRequest.save();
    res.status(201).json({ message: 'Repair request created successfully', repairRequest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create repair request', details: error.message });
  }
};