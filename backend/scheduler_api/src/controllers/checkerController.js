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

    // Obtener la fecha actual sin la hora en formato de cadena
    courses[0].startDate = courses[0].startDate.split('T')[0];
    console.log(courses[0].startDate);

    const currentDate = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    for (const course of courses) {
      const courseStartDate = new Date(course.startDate.split('T')[0]);
      const formattedStartDate = courseStartDate.toISOString().split('T')[0];
      const daysUntilCourse = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24));
      
      //Hay que verificar que las fechas estén en un formato correcto, porque no se están guardando bien

      console.log(`Course: ${course.name}, Start Date: ${formattedStartDate}, Days until course: ${daysUntilCourse}`);

      if (daysUntilCourse >= 0 && daysUntilCourse <= 7) {
        const notification = new Notification({
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${course.startDate}`, // Cambiado de 'date' a 'startDate'
          date: new Date(),
        });

        await notification.save();
        await axios.post(`${process.env.NOTIFICATION_API_URL}/notification`, {
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${course.startDate}`, // Cambiado de 'date' a 'startDate'
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
