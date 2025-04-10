const express = require("express");
const { createCourse, getCourses, getCourse, updateCourse, deleteCourse, addModule, addLesson } = require("../controllers/courseController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getCourses).post(createCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);
router.route("/:id/modules").post(addModule);
router.route("/:id/modules/:moduleId/lessons").post(addLesson);

module.exports = router;
