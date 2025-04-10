const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  theme: { type: String, enum: ["light", "dark"], default: "light" },
  notifications: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
  },
  defaultDifficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: String,
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    settings: { type: settingsSchema, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
