const axios = require("axios");

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get(
      `${process.env.MONGO_API_URL}/get-all-classes`
    );
    const classes = response.data;

    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    for (const classItem of classes) {
      const classDate = new Date(classItem.date);
      if (classDate <= oneWeekFromNow) {
        const notification = new Notification({
          classId: classItem._id,
          message: `Reminder: Your class ${classItem.name} is coming up on ${classItem.date}`,
          date: new Date(),
        });

        await notification.save();

        await axios.post(`${process.env.NOTIFICATION_API_URL}/notification`, {
          classId: classItem._id,
          message: `Reminder: Your class ${classItem.name} is coming up on ${classItem.date}`,
        });

        console.log(`Notification sent for class ${classItem.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking for upcoming classes:", error);
  }
};

const checkForUpcomingCourses = async () => {
  pass;
};

const checkForEndOfCourses = async () => {
  pass;
};

module.exports = {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
  checkForEndOfCourses,
};
