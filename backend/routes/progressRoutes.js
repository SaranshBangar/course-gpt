const express = require("express");
const { updateProgress, getProgress, getAllProgress, markLessonComplete } = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getAllProgress);
router.route("/:courseId").get(getProgress).post(updateProgress);
router.route("/:courseId/complete/:lessonId").put(markLessonComplete);

module.exports = router;
