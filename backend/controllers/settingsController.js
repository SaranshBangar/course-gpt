const User = require("../models/User");

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { theme, notifications, defaultDifficulty } = req.body;

    const settingsFields = {};

    if (theme) settingsFields.theme = theme;
    if (notifications) settingsFields.notifications = notifications;
    if (defaultDifficulty) settingsFields.defaultDifficulty = defaultDifficulty;

    const user = await User.findByIdAndUpdate(req.user.id, { settings: settingsFields }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.hasOwnProperty("email")) {
      user.settings.notifications.email = req.body.email;
    }

    if (req.body.hasOwnProperty("inApp")) {
      user.settings.notifications.inApp = req.body.inApp;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (error) {
    next(error);
  }
};
