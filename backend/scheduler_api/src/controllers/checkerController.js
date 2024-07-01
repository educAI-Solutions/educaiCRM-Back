const axios = require("axios");
const e = require("express");

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/classes/get-all"); 
    const classes = response.data.data;

    const currentDate = new Date();

    // Filter the upcoming classes in the next 14 days
    const upcomingClasses = classes.filter(classItem => {
      const classStartDate = new Date(classItem.date.split('T')[0]);
      const daysUntilClassStart = Math.ceil((classStartDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilClassStart >= 0 && daysUntilClassStart <= 14;
    });

    // Print the number of upcoming classes in the next 14 days
    console.log(`Total classes in the next 14 days: ${upcomingClasses.length}\n`);

    // Give me the number of participants who have classes in the next 14 days [IMPORTANT]
    let participants = []
    for (const classItem of upcomingClasses) {
      participants = participants.concat(classItem.participants)
    }
    const uniqueParticipants = [...new Set(participants)]
    console.log(`Total participants with classes in the next 14 days: ${uniqueParticipants.length}\n`);

    // Show me the _id of the participants who have classes in the next 14 days [IMPORTANT]
    const participantIds = uniqueParticipants.map(participant => participant.participant)
    console.log(`Participant IDs with classes in the next 14 days: ${participantIds}\n`);

    // Notify the participants of the upcoming classes
    for (const classItem of upcomingClasses) {
      const classStartDate = new Date(classItem.date.split('T')[0]); // Convert the class start date into a Date object
      const formattedStartDate = classStartDate.toISOString().split('T')[0]; // Format the class start date
      const daysUntilClassStart = Math.ceil(classStartDate - currentDate) / (1000 * 60 * 60 * 24); // Calculate the days until the class starts

      // Show the class details
      console.log(`Class: ${classItem.name}\nStart Date: ${formattedStartDate}\nDays until class start: ${daysUntilClassStart}\n`);

      const participants = classItem.participants
      // get the participant _id for each participant on the participants array
      const participantIds = participants.map(participant => participant.participant)

      let notificationIds = []

      // send a post request to the mongoapi to create a notification for each participant
      for (const participantId of participantIds) {
        const notification = {
          recipient: participantId,
          type: "Info",
          subject: `Class ${classItem.name} starts in less than 14 days`,
          content: `Reminder: Your class ${classItem.name} is coming up on ${formattedStartDate}`,
          programId: classItem.course.program, // I'm not sure, please check
          courseId: classItem.course._id,
          classId: classItem.course.classes._id, // I'm not sure, please check
        }
        const response = await axios.post("http://localhost:5050/api/notifications/", notification);
        notificationIds.push(response.data.data._id)
      }

      try {
        // Get the id of the notification created
        for (const notificationId of notificationIds) {
          const notificationSentResponse = await axios.post(
            "http://127.0.0.1:9090/notifications",
            {
              id: notificationId,
            }
          );
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }


      // send a post request to the notification api to send each notification
      
      console.log(`Notification sent for class ${classItem.name}`);
    }
  } catch (error) {
    console.error("Error checking for upcoming classes:", error);
  }
};

const checkForUpcomingCourses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/courses/get-all");
    const courses = response.data.data;

    // Get the current date
    const currentDate = new Date();

    // Filter the upcoming courses in the next 14 days
    const upcomingCourses = courses.filter(course => {
      const courseStartDate = new Date(course.startDate.split('T')[0]);
      const daysUntilCourseStart = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilCourseStart >= 0 && daysUntilCourseStart <= 14;
    });

    // Print the number of upcoming courses in the next 14 days
    console.log(`Total courses in the next 14 days: ${upcomingCourses.length}\n`);

    // Give me the number of instructors who have courses in the next 14 days [IMPORTANT]
    let instructors = []
    for (const course of upcomingCourses) {
      instructors = instructors.concat(course.instructors)
    }
    const uniqueInstructors = [...new Set(instructors)]
    console.log(`Total instructors with courses in the next 14 days: ${uniqueInstructors.length}\n`);

    //show me the name of the instructors who have courses in the next 14 days [IMPORTANT]
    const instructorNames = uniqueInstructors.map(instructor => instructor.username)
    console.log(`Instructor names with courses in the next 14 days: ${instructorNames}\n`);

    //show me the email of the instructors who have courses in the next 14 days [IMPORTANT]
    const instructorEmails = uniqueInstructors.map(instructor => instructor.email)
    console.log(`Instructor emails with courses in the next 14 days: ${instructorEmails}\n`);
    


    // Notify the instructors of the upcoming courses
    for (const course of upcomingCourses) {
      const courseStartDate = new Date(course.startDate.split('T')[0]); // Convert the course start date into a Date object
      const formattedStartDate = courseStartDate.toISOString().split('T')[0]; // Format the course start date
      const daysUntilCourseStart = Math.ceil((courseStartDate - currentDate) / (1000 * 60 * 60 * 24)); // Calculate the days until the course starts 
      const courseEndDate = new Date(course.endDate.split('T')[0]); // Convertir la fecha de finalización del curso en un objeto Date
      const formattedEndDate = courseEndDate.toISOString().split('T')[0]; // Formatear la fecha de finalización del curso
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24)); // Calcular los días hasta el final del curso

      // show the course details
      console.log(`Course: ${course.name}\nStart Date: ${formattedStartDate}\nEnd Date: ${formattedEndDate}\nDays until course start: ${daysUntilCourseStart}\nDays until course end: ${daysUntilCourseEnd}\n`);

      const instructors = course.instructors
      // get the instructor _id for each instructor on the instructors array
      const instructorIds = instructors.map(instructor => instructor._id)
      
      let notificationIds = []

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "info",
          subject: `Course ${course.name} starts in less than 14 days`,
          content: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          programId: course.program._id,
          courseId: course._id,
        }
        const response = await axios.post("http://localhost:5050/api/notifications/", notification);
        notificationIds.push(response.data.data._id)
      }

      try {
        // Get the id of the notification created
        for (const notificationId of notificationIds) {
          const notificationSentResponse = await axios.post(
            "http://127.0.0.1:9090/notifications",
            {
              id: notificationId,
            }
          );
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }

      // send a post request to the notification api to send each notification

      console.log(`Notification sent for course ${course.name}`);
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

    let instructors = []
    for (const course of endingCourses) {
      instructors = instructors.concat(course.instructors);
    }
    const uniqueInstructors = [...new Set(instructors)];
    console.log(`Total instructors with courses ending in the next 7 days: ${uniqueInstructors.length}\n`);

    // Mostrar los nombres de los instructores que tienen cursos terminando en los próximos 7 días
    const instructorNames = uniqueInstructors.map(instructor => instructor.username);
    console.log(`Instructor names with courses ending in the next 7 days: ${instructorNames.join(', ')}\n`);

    // mostrar correo de los instructores que tienen cursos terminando en los próximos 7 días
    const instructorEmails = uniqueInstructors.map(instructor => instructor.email);
    console.log(`Instructor emails with courses ending in the next 7 days: ${instructorEmails.join(', ')}\n`);

    // Notificar los cursos que terminan en la próxima semana
    for (const course of endingCourses) {
      const courseEndDate = new Date(course.endDate.split('T')[0]);
      const formattedEndDate = courseEndDate.toISOString().split('T')[0];
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24));

      // Mostrar detalles del curso
      console.log(`Course ending soon: ${course.name}\nEnd Date: ${formattedEndDate}\nDays until course end: ${daysUntilCourseEnd}\n`);

      const instructors = course.instructors
      // get the instructor _id for each instructor on the instructors array
      const instructorIds = instructors.map(instructor => instructor._id)

      let notificationIds = []

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "info",
          subject: `Course ${course.name} is ending soon`,
          content: `Reminder: Your course ${course.name} is ending on ${formattedEndDate}`,
          courseId: course._id,
        }
        const response = await axios.post("http://localhost:5050/api/notifications/", notification);
        notificationIds.push(response.data.data._id)
      } 

      try {
        // Get the id of the notification created
        for (const notificationId of notificationIds) {
          const notificationSentResponse = await axios.post(
            "http://127.0.0.1:9090/notifications",
            {
              id: notificationId,
            }
          );
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
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
