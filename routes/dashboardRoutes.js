const express = require('express');
const router = express.Router();
const { getDashboardInfo, getAdminDashboardInfo } = require('../controllers/dashboardControlleur');

// Route pour récupérer les informations du tableau de bord
router.get('/', getDashboardInfo);
router.get('/admin', getAdminDashboardInfo);

module.exports = router;
