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
        progressHistory: [{ date: new Date(), percentage: req.body.progressPercentage || 0 }],
      });
    } else {
      // If progress percentage is changing, add to history
      if (req.body.progressPercentage !== undefined && progress.progressPercentage !== req.body.progressPercentage) {
        req.body.progressHistory = [...progress.progressHistory, { date: new Date(), percentage: req.body.progressPercentage }];
      }

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
      // Create a new progress entry if not found
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course not found with id of ${req.params.courseId}`,
        });
      }

      // Initialize with valid ObjectIds
      const moduleId = course.modules.length > 0 ? course.modules[0]._id : null;
      const lessonId = moduleId && course.modules[0].lessons && course.modules[0].lessons.length > 0 ? course.modules[0].lessons[0]._id : null;

      const newProgress = await CourseProgress.create({
        user: req.user.id,
        course: req.params.courseId,
        currentModule: moduleId,
        currentLesson: lessonId,
        completedLessons: [],
        progressPercentage: 0,
      });

      return res.status(200).json({
        success: true,
        data: newProgress,
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
      const newPercentage = Math.round((completedCount / totalLessons) * 100);
      progress.progressPercentage = newPercentage;

      // Add to history if percentage changed
      if (newPercentage !== progress.progressPercentage) {
        progress.progressHistory.push({
          date: new Date(),
          percentage: newPercentage,
        });
      }

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

// New function to get progress history
exports.getProgressHistory = async (req, res, next) => {
  try {
    const progress = await CourseProgress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this course",
      });
    }

    // Format the history data for the chart
    const formattedHistory = progress.progressHistory.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      progress: item.percentage,
    }));

    res.status(200).json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    next(error);
  }
};

// Function to create course progress for all users when a new course is created
exports.createProgressForNewCourse = async (courseId, userId) => {
  try {
    // Find the course to get the first module and lesson IDs
    const course = await Course.findById(courseId);
    if (!course || !course.modules || course.modules.length === 0) {
      await CourseProgress.create({
        user: userId,
        course: courseId,
        currentModule: null,
        currentLesson: null,
        completedLessons: [],
        progressPercentage: 0,
      });
      return true;
    }

    // Get first module and lesson IDs
    const moduleId = course.modules[0]._id;
    const lessonId = course.modules[0].lessons && course.modules[0].lessons.length > 0 ? course.modules[0].lessons[0]._id : null;

    await CourseProgress.create({
      user: userId,
      course: courseId,
      currentModule: moduleId,
      currentLesson: lessonId,
      completedLessons: [],
      progressPercentage: 0,
    });
    return true;
  } catch (error) {
    console.error("Error creating progress for new course:", error);
    return false;
  }
};
