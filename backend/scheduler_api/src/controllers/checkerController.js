const axios = require("axios");

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/classes/get-all");
    const classes = response.data.data;

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
  try {
    const response = await axios.get("http://localhost:5050/api/courses/get-all");
    const courses = response.data.data;

    const currentDate = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    for (const course of courses) {
      // Convertir la fecha del curso a un objeto Date (asumiendo que el formato es ISO 8601)
      const courseStartDate = new Date(course.startDate); 

      // Calcular los días restantes en formato numérico
      const daysUntilCourse = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24));

      // Formatear la fecha de inicio del curso para mostrar (elige el formato que prefieras)
      const formattedStartDate = courseStartDate.toLocaleDateString(); // Ejemplo: "12/31/2023"

      console.log(`Course: ${course.name}, Start Date: ${formattedStartDate}, Days until course: ${daysUntilCourse}`);

      if (daysUntilCourse >= 0 && daysUntilCourse <= 7) {
        const notification = new Notification({
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          date: new Date(),
        });

        await notification.save();
        await axios.post(`${process.env.NOTIFICATION_API_URL}/notification`, {
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
        });

        console.log(`Notification sent for course ${course.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking for upcoming courses:", error);
  }
};


const checkForEndOfCourses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/courses/get-all");
    const courses = response.data.data;

    const currentDate = new Date();

    for (const course of courses) {
      const endDate = new Date(course.endDate);
      if (endDate <= currentDate) {
        const notification = new Notification({
          courseId: course._id,
          message: `Reminder: Your course ${course.name} has ended on ${course.endDate}`,
          date: new Date(),
        });

        await notification.save();

        await axios.post(`${process.env.NOTIFICATION_API_URL}/notification`, {
          courseId: course._id,
          message: `Reminder: Your course ${course.name} has ended on ${course.endDate}`,
        });

        console.log(`Notification sent for course ${course.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking for end of courses:", error);
  }
};


module.exports = {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
  checkForEndOfCourses,
};
