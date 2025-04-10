const express = require("express");
const { getSettings, updateSettings, toggleNotifications } = require("../controllers/settingsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getSettings).put(updateSettings);
router.route("/notifications").patch(toggleNotifications);

module.exports = router;
