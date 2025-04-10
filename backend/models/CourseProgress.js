const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  currentModule: mongoose.Schema.Types.ObjectId,
  currentLesson: mongoose.Schema.Types.ObjectId,
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  lastAccessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CourseProgress", progressSchema);
