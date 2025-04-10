const express = require("express");
const { generateLessonContent, enhanceContent, generateCourseStructure } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/generate-lesson", generateLessonContent);
router.post("/enhance-content/:courseId", enhanceContent);
router.post("/generate-course-structure", generateCourseStructure);

module.exports = router;
