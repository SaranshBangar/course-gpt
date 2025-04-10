const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

exports.updateProgress = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course not found with id of ${req.params.courseId}`,
      });
    }

    let progress = await CourseProgress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        user: req.user.id,
        course: req.params.courseId,
        currentModule: req.body.currentModule,
        currentLesson: req.body.currentLesson,
        completedLessons: req.body.completedLessons || [],
        progressPercentage: req.body.progressPercentage || 0,
      });
    } else {
      progress = await CourseProgress.findOneAndUpdate({ user: req.user.id, course: req.params.courseId }, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const progress = await CourseProgress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for this course",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProgress = async (req, res, next) => {
  try {
    const allProgress = await CourseProgress.find({
      user: req.user.id,
    }).populate("course", "title");

    res.status(200).json({
      success: true,
      count: allProgress.length,
      data: allProgress,
    });
  } catch (error) {
    next(error);
  }
};

exports.markLessonComplete = async (req, res, next) => {
  try {
    let progress = await CourseProgress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for this course",
      });
    }

    const lessonCompleted = progress.completedLessons.includes(req.params.lessonId);

    if (!lessonCompleted) {
      progress.completedLessons.push(req.params.lessonId);

      const course = await Course.findById(req.params.courseId);
      let totalLessons = 0;

      course.modules.forEach((module) => {
        totalLessons += module.lessons.length;
      });

      const completedCount = progress.completedLessons.length;
      progress.progressPercentage = Math.round((completedCount / totalLessons) * 100);

      progress.lastAccessed = Date.now();

      await progress.save();
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
