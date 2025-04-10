const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  aiContent: {
    title: String,
    description: String,
    learningOutcomes: [String],
    keyConcepts: [String],
    activities: [String],
  },
  editedContent: {
    title: String,
    description: String,
    learningOutcomes: [String],
    keyConcepts: [String],
    activities: [String],
  },
  order: Number,
});

const moduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  prerequisites: [String],
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },
  estimatedTime: Number,
  lessons: [lessonSchema],
  order: Number,
});

const courseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    modules: [moduleSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
