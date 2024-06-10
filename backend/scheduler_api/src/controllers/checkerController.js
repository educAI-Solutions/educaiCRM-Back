const axios = require("axios");

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/classes/get-all"); 
    const classes = response.data.data;
    const currentDate = new Date();
    const oneWeekFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingClasses = classes.filter(classItem => { 
      const classStartDate = new Date(classItem.date.split('T')[0]); // convertimos la fecha de inicio de la clase en un objeto Date
      const daysUntilClassStart = Math.ceil((classStartDate - currentDate) / (1000 * 60 * 60 * 24)); // calculamos los días hasta el inicio de la clase
      return daysUntilClassStart >= 0 && daysUntilClassStart <= 14; // filtramos las clases que comienzan en los próximos 14 días
    });

    console.log(`Total classes in the next 14 days: ${upcomingClasses.length}\n`);

    for (const classItem of upcomingClasses) {
      const classStartDate = new Date(classItem.date.split('T')[0]); // Convertir la fecha de inicio de la clase en un objeto Date
      const formattedStartDate = classStartDate.toISOString().split('T')[0]; // Formatear la fecha de inicio de la clase
      const daysUntilClassStart = Math.ceil((classStartDate - currentDate) / (1000 * 60 * 60 * 24)); // calcular los días hasta el inicio de la clase
      console.log(`Next upcoming class: ${classItem.name}\nStart Date: ${formattedStartDate}\nDays until class start: ${daysUntilClassStart}\n`); // Mostrar los detalles de la clase
      
      /* if (classStartDate <= oneWeekFromNow) {
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
      } */
    }
  } catch (error) {
    console.error("Error checking for upcoming classes:", error);
  }
};


const checkForUpcomingCourses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/courses/get-all");
    const courses = response.data.data;

    // Obtener la fecha actual
    const currentDate = new Date();

    // Filtración de los cursos próximos en los próximos 14 días
    const upcomingCourses = courses.filter(course => {
      const courseStartDate = new Date(course.startDate.split('T')[0]);
      const daysUntilCourseStart = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilCourseStart >= 0 && daysUntilCourseStart <= 14;
    });

    // Imprimir la cantidad de cursos próximos en los próximos 14 días
    console.log(`Total courses in the next 14 days: ${upcomingCourses.length}\n`);

    // Notificar los cursos que comienzan en los próximos 14 días
    for (const course of upcomingCourses) {
      const courseStartDate = new Date(course.startDate.split('T')[0]); // Convertir la fecha de inicio del curso en un objeto Date
      const formattedStartDate = courseStartDate.toISOString().split('T')[0]; // Formatear la fecha de inicio del curso
      const daysUntilCourseStart = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24)); // Calcular los días hasta el inicio del curso

      // agregarlo en la función de abajo
      const courseEndDate = new Date(course.endDate.split('T')[0]); // Convertir la fecha de finalización del curso en un objeto Date
      const formattedEndDate = courseEndDate.toISOString().split('T')[0]; // Formatear la fecha de finalización del curso
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24)); // Calcular los días hasta el final del curso

      // Mostrar los detalles del curso
      console.log(`Course: ${course.name}\nStart Date: ${formattedStartDate}\nEnd Date: ${formattedEndDate}\nDays until course start: ${daysUntilCourseStart}\nDays until course end: ${daysUntilCourseEnd}\n`);

      const instructors = course.instructors
      // get the instructor _id for each instructor on the instructors array
      const instructorIds = instructors.map(instructor => instructor._id)
      console.log(course)
      console.log(instructorIds)

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "Info",
          subject: `Course ${course.name} starts in less than 14 days`,
          content: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          programId: course.program._id,
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          date: new Date(),
        };

        await notification.save();
        await axios.post(`${process.env.NOTIFICATION_API_URL}/notification`, {
          courseId: course._id,
          message: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
        });

        console.log(`Notification sent for course ${course.name}`);
      }

      // send a post request to the notification api to send each notification

    }
  } catch (error) {
    console.error("Error checking for upcoming courses:", error);
  }
};


const checkForEndOfCourses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/courses/get-all");
    const courses = response.data.data;

    // Obtener la fecha actual
    const currentDate = new Date();

    // Filtrar los cursos que terminan en la próxima semana
    const endingCourses = courses.filter(course => {
      const courseEndDate = new Date(course.endDate.split('T')[0]);
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilCourseEnd >= 0 && daysUntilCourseEnd <= 7;
    });

    // Imprimir la cantidad de cursos que terminan en la próxima semana
    console.log(`Total courses ending in the next 7 days: ${endingCourses.length}\n`);

    // Notificar los cursos que terminan en la próxima semana
    for (const course of endingCourses) {
      const courseEndDate = new Date(course.endDate.split('T')[0]);
      const formattedEndDate = courseEndDate.toISOString().split('T')[0];
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24));

      // Mostrar detalles del curso
      console.log(`Course ending soon: ${course.name}\nEnd Date: ${formattedEndDate}\nDays until course end: ${daysUntilCourseEnd}\n`);
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
