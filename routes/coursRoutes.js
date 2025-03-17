const express = require("express");
const router = express.Router();
const coursController = require("../controllers/coursController");

router.post("/", coursController.createCours);
router.get("/", coursController.getAllCours);
router.get("/:id", coursController.getCoursById);
router.put("/:id", coursController.updateCours);
router.delete("/:id", coursController.deleteCours);

module.exports = router;
