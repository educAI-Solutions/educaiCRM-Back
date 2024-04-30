const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const { recipient, type, content, subject, programId, courseId, classId } =
      req.body;

    const notification = new Notification({
      recipient,
      type,
      subject,
      content,
      programId,
      courseId,
      classId,
    });

    await notification.save();

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId }).sort({
      timestampCreated: -1,
    });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { read } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    notification.read = read;
    notification.timestampRead = read ? Date.now() : null;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
