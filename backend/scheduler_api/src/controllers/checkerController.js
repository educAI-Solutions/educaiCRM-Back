const axios = require("axios");

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get("http://localhost:5050/api/classes/get-all"); 
    const classes = response.data.data;

    console.log(classes)

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
    const participantIds = uniqueParticipants.map(participant => participant._id)
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
      const participantIds = participants.map(participant => participant._id)

      // send a post request to the mongoapi to create a notification for each participant
      for (const participantId of participantIds) {
        const notification = {
          recipient: participantId,
          type: "Info, please read the content",
          subject: `Class ${classItem.name} starts in less than 14 days`,
          content: `Reminder: Your class ${classItem.name} is coming up on ${formattedStartDate}`,
          programId: classItem.course.program, // I'm not sure, please check
          courseId: classItem.course._id,
          classId: classItem.course.classes._id, // I'm not sure, please check
        }
        await axios.post("http://localhost:5050/api/notifications/", notification);
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

    console.log(courses)

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

    // Show me the _id of the instructors who have courses in the next 14 days [IMPORTANT]
    const instructorIds = uniqueInstructors.map(instructor => instructor._id)
    console.log(`Instructor IDs with courses in the next 14 days: ${instructorIds}\n`);


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

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "Info, please read the content",
          subject: `Course ${course.name} starts in less than 14 days`,
          content: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          programId: course.program._id,
          courseId: course._id,
        }
        await axios.post("http://localhost:5050/api/notifications/", notification);
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

    // Get the current date
    const currentDate = new Date();

    // Filter the courses that end in the next 14 days
    const endOfCourses = courses.filter(course => {
      const courseEndDate = new Date(course.endDate.split('T')[0]);
      const daysUntilCourseEnd = Math.ceil((courseEndDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilCourseEnd >= 0 && daysUntilCourseEnd <= 14;
    });

    // Print the number of courses that end in the next 14 days
    console.log(`Total courses that end today: ${endOfCourses.length}\n`);

    // Give me the number of instructors who have courses that end in the next 14 days [IMPORTANT]
    let instructors = []
    for (const course of endOfCourses) {
      instructors = instructors.concat(course.instructors)
    }
    const uniqueInstructors = [...new Set(instructors)]
    console.log(`Total instructors with courses that end today: ${uniqueInstructors.length}\n`);

    // Give me the number of participants who have courses that end in the next 14 days [IMPORTANT]
    let participants = []
    for (const course of endOfCourses) {
      participants = participants.concat(course.participants)
    }
    const uniqueParticipants = [...new Set(participants)]
    console.log(`Total participants with courses that end today: ${uniqueParticipants.length}\n`);

    // Show me the _id of the instructors and participants who have courses that end in the next 14 days [IMPORTANT]
    const instructorIds = uniqueInstructors.map(instructor => instructor._id)
    const participantIds = uniqueParticipants.map(participant => participant._id)
    console.log(`Instructor IDs with courses that end today: ${instructorIds}\n`);
    console.log(`Participant IDs with courses that end today: ${participantIds}\n`);

    // Notify the instructors and participants of the courses that end in the next 14 days

    for (const course of endOfCourses) {
      const courseEndDate = new Date(course.endDate.split('T')[0]); // Convert the course end date into a Date object
      const formattedEndDate = courseEndDate.toISOString().split('T')[0]; // Format the course end date
      const daysUntilCourseEnd = Math.ceil(courseEndDate - currentDate) / (1000 * 60 * 60 * 24); // Calculate the days until the course ends
      const daysUntilCourseEndInt = parseInt(daysUntilCourseEnd)

      // Show the course details
      console.log(`Course: ${course.name}\nEnd Date: ${formattedEndDate}\nDays until course end: ${daysUntilCourseEndInt}\n`);}

      // send a post request to the mongoapi to create a notification for each instructor and participant
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "QUEATE QUIETO QUE TE MATO",
          subject: `Course ${course.name} ends in less than 14 days`,
          content: `Reminder: Your course ${course.name} ends on ${formattedEndDate}`,
          programId: course.program._id,
          courseId: course._id,
          classId: course.classes._id,
        }

        for (const participantId of participantIds) {
          const notification = {
            recipient: participantId,
            type: "Info, please read the content",
            subject: `Course ${course.name} ends in less than 14 days`,
            content: `Reminder: Your course ${course.name} ends on ${formattedEndDate}`,
            programId: course.program._id,
            courseId: course._id,
            classId: course.classes._id,
          }
        }

        await axios.post("http://localhost:5050/api/notifications/", notification); // problemas con el course, revisar para un correcto funcionamiento
      }

      // send a post request to the notification api to send each notification

      console.log(`Notification sent for course ${course.name}`);
    } catch (error) {
    console.error("Error checking for end of courses:", error);
  }
};


//Code update

module.exports = {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
  checkForEndOfCourses,
};
