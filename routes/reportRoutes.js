const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route pour créer un nouveau rapport
router.post('/', reportController.createReport);
router.get("/", reportController.getAllReports);
router.put("/:reportId/seen", reportController.updateReportSeen);


module.exports = router;
