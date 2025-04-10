const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    currentModule: { type: mongoose.Schema.Types.ObjectId, ref: "Module", default: null },
    currentLesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", default: null },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessed: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseProgress", progressSchema);
