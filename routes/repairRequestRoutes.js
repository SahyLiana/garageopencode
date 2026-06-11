const express = require('express');
const router = express.Router();
const repairRequestController = require('../controllers/repairRequestController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route for creating a repair request with image uploads
router.post('/', upload.array('images', 5), repairRequestController.createRepairRequest);

module.exports = router;