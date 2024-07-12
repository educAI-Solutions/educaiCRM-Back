const axios = require("axios");
const e = require("express");
const dotenv = require("dotenv");
const QRCode = require("qrcode");

dotenv.config();

const checkForUpcomingClasses = async () => {
  try {
    const response = await axios.get(
      "http://mongo_api:5050/api/classes/get-all"
    );
    const classes = response.data.data;

    const currentDate = new Date();

    // Filter the classes with alertedAttendance set to false and alertedClass set to false
    const classesToAlert = classes.filter(
      (classItem) => !classItem.alertedAttendance && !classItem.alertedClass
    );

    // Filter the upcoming classes in the next 7 days
    const upcomingClasses = classesToAlert.filter((classItem) => {
      const classStartDate = new Date(classItem.date.split("T")[0]);
      const daysUntilClassStart = Math.ceil(
        (classStartDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return daysUntilClassStart >= 0 && daysUntilClassStart <= 7;
    });

    // Print the number of upcoming classes in the next 7 days
    console.log(
      `Total classes in the next 7 days without alert: ${upcomingClasses.length}\n`
    );

    // Logic for each of the upcoming classes
    for (const classItem of upcomingClasses) {
      const classStartDate = new Date(classItem.date.split("T")[0]); // Convert the class start date into a Date object
      const formattedStartDate = classStartDate.toISOString().split("T")[0]; // Format the class start date
      const daysUntilClassStart =
        Math.ceil(classStartDate - currentDate) / (1000 * 60 * 60 * 24); // Calculate the days until the class starts

      // Show the class details
      console.log(
        `Class: ${classItem.name}\nStart Date: ${formattedStartDate}\nDays until class start: ${daysUntilClassStart}\n`
      );

      const participants = classItem.participants;
      const instructors = classItem.instructors;
      // get the participant _id for each participant on the participants array
      const participantIds = participants.map(
        (participant) => participant.participant
      );

      let surveyResponse_class;
      let surveyResponse_food;
      let surveyResponse_attendance;

      // Create a attendance survey for the participants of the class on the mongoapi
      try {
        surveyResponse_attendance = await axios.post(
          "http://mongo_api:5050/api/survey/create-attendance-survey",
          {
            classId: classItem._id,
            participants: participantIds,
          }
        );
        console.log(
          `Attendance survey created for class ${classItem.name} with id ${surveyResponse_attendance.data.surveyId}`
        );
      } catch (error) {
        console.error("Error creating attendance survey:", error);
      }

      // Create a class survey for the teachers of the class on the mongoapi
      try {
        surveyResponse_class = await axios.post(
          "http://mongo_api:5050/api/survey/create-class-survey",
          {
            classId: classItem._id,
            participants: instructors,
          }
        );
        console.log(
          `Class survey created for class ${classItem} with id ${surveyResponse_class.data.surveyId}`
        );
      } catch (error) {
        console.error("Error creating class survey:", error);
      }

      // Create a food survey for the participants of the class on the mongoapi
      try {
        surveyResponse_food = await axios.post(
          "http://mongo_api:5050/api/survey/create-food-survey",
          {
            classId: classItem._id,
            participants: participantIds,
          }
        );
        console.log(
          `Food survey created for class ${classItem.name} with id ${surveyResponse_food.data.surveyId}`
        );
      } catch (error) {
        console.error("Error creating food survey:", error);
      }

      // Change the alertedAttendance and alertedClass fields to true
      try {
        const updateResponse = await axios.put(
          `http://mongo_api:5050/api/classes/update/${classItem._id}`,
          {
            alertedAttendance: true,
            alertedClass: true,
          }
        );
        console.log(
          `Alerted attendance and class for class ${classItem} with response: ${updateResponse.data.message}`
        );
      } catch (error) {
        console.error("Error updating class:", error);
      }

      let notificationIds = [];

      // Generate QR code for the class survey
      const qrCodeData = await QRCode.toDataURL(
        `${process.env.FRONTEND_URL}/class-survey/${classItem._id}/${surveyResponse_class.data.surveyId}/${surveyResponse_food.data.surveyId}`
      );

      // send a post request to the mongoapi to create a notification for each participant
      for (const participantId of participantIds) {
        const notification = {
          recipient: participantId,
          type: "Info",
          subject: `Class ${classItem.name} starts in less than 7 days`,
          content: `Reminder: Your class ${classItem.name} is coming up on ${formattedStartDate}. Here is the link for class survey: ${process.env.FRONTEND_URL}/class-survey/${classItem._id}/${surveyResponse_class.data.surveyId}/${surveyResponse_food.data.surveyId}`,
          programId: classItem.course.program, // I'm not sure, please check
          courseId: classItem.course._id,
          classId: classItem.course.classes._id, // I'm not sure, please check
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
      }

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructor of instructors) {
        const notification = {
          recipient: instructor,
          type: "Info",
          subject: `Class ${classItem.name} starts in less than 7 days`,
          content: `Reminder: Your class ${classItem.name} is coming up on ${formattedStartDate}. Here is the link for the attendance survey: ${process.env.FRONTEND_URL}/attendance-survey/${classItem._id}/${surveyResponse_attendance.data.surveyId}`,
          programId: classItem.course.program, // I'm not sure, please check
          courseId: classItem.course._id,
          classId: classItem.course.classes._id, // I'm not sure, please check
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
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

      // Generate QR code for the attendance survey and send it over to the storage api to store it

      const attendanceSurveyLink = `${process.env.FRONTEND_URL}/attendance-survey/${classItem._id}/${surveyResponse_attendance.data.surveyId}`;

      // Generate the file for the QR code on memory not the buffer
      const qrCode = await QRCode.toDataURL(attendanceSurveyLink);

      // Send to png file to storage api as req.file
      try {
        const formData = new FormData();
        // Convert the Data URL to a Blob
        const dataUrlParts = qrCode.split(",");
        const mimeType = dataUrlParts[0].match(/:(.*?);/)[1];
        const blob = await (await fetch(qrCode)).blob();
        const file = new File([blob], "qrcode.png", { type: mimeType });
        formData.append("file", file);

        // include also surveyId on the form data
        formData.append("surveyId", surveyResponse_attendance.data.surveyId);

        const attendanceSurveyResponse = await axios.post(
          "http://storage_api:7070/storage/upload/qr-code",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(
          `Attendance survey QR code uploaded for class ${classItem} with response: ${attendanceSurveyResponse.data}`
        );
      } catch (error) {
        console.error("Error uploading attendance survey:", error);
      }
    }
  } catch (error) {
    console.error("Error checking for upcoming classes:", error);
  }
};

const checkForUpcomingCourses = async () => {
  try {
    const response = await axios.get(
      "http://mongo_api:5050/api/courses/get-all"
    );
    const courses = response.data.data;

    // Filter the courses with alertedStart set to false
    const coursesToAlert = courses.filter((course) => !course.alertedStart);

    // Get the current date
    const currentDate = new Date();

    // Filter the upcoming courses in the next 7 days
    const upcomingCourses = coursesToAlert.filter((course) => {
      const courseStartDate = new Date(course.startDate.split("T")[0]);
      const daysUntilCourseStart = Math.ceil(
        (courseStartDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return daysUntilCourseStart >= 0 && daysUntilCourseStart <= 28;
    });

    // Print the number of upcoming courses in the next 7 days
    console.log(
      `Total courses in the next 28 days: ${upcomingCourses.length}\n`
    );
    // Notify the instructors of the upcoming courses
    for (const course of upcomingCourses) {
      const instructors = course.instructors;
      const participants = course.participants;
      // get the instructor _id for each instructor on the instructors array
      const instructorIds = instructors.map((instructor) => instructor._id);

      let notificationIds = [];

      // send a post request to the mongoapi to create a notification for each instructor
      for (const instructorId of instructorIds) {
        const notification = {
          recipient: instructorId,
          type: "info",
          subject: `Course ${course.name} starts in less than 7 days`,
          content: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          programId: course.program._id,
          courseId: course._id,
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
      }

      for (const participant of participants) {
        const notification = {
          recipient: participant,
          type: "info",
          subject: `Course ${course.name} starts in less than 7 days`,
          content: `Reminder: Your course ${course.name} is coming up on ${formattedStartDate}`,
          programId: course.program._id,
          courseId: course._id,
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
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

      // change the alertedStart field to true
      try {
        const updateResponse = await axios.put(
          `http://mongo_api:5050/api/courses/update/${course._id}`,
          {
            alertedStart: true,
          }
        );
        console.log(
          `Alerted start for course ${course.name} with response: ${updateResponse.data.message}`
        );
      } catch (error) {
        console.error("Error updating course:", error);
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
    const response = await axios.get(
      "http://mongo_api:5050/api/courses/get-all"
    );
    const courses = response.data.data;

    // Filter out the courses that have state inactive
    const activeCourses = courses.filter((course) => course.state === "active");

    // Obtener la fecha actual
    const currentDate = new Date();

    // Filtrar los cursos que terminan en la próxima semana
    const endingCourses = activeCourses.filter((course) => {
      const courseEndDate = new Date(course.endDate.split("T")[0]);
      const daysUntilCourseEnd = Math.ceil(
        (courseEndDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return daysUntilCourseEnd >= 0 && daysUntilCourseEnd <= 21;
    });

    const mustCloseCourses = activeCourses.filter((course) => {
      const courseEndDate = new Date(course.endDate.split("T")[0]);
      const daysUntilCourseEnd = Math.ceil(
        (courseEndDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return daysUntilCourseEnd < 0;
    });

    // Separate into 2 different arrays the courses that have alertTeacher set to false and alertTeacher set to true
    const coursesToCreate = endingCourses.filter(
      (course) => !course.alertedTeacher
    );
    const coursesToAlert = endingCourses.filter(
      (course) => course.alertedTeacher
    );

    // Create 3 smaller groups with coursesToAlert, one for courses ending in 21 to 14 days, one for courses ending in 14 to 7 days, and one for courses ending in 7 to 0 days
    const coursesToAlert21 = coursesToAlert.filter(
      (course) => course.daysUntilCourseEnd >= 14
    );
    const coursesToAlert14 = coursesToAlert.filter(
      (course) =>
        course.daysUntilCourseEnd >= 7 && course.daysUntilCourseEnd < 14
    );
    const coursesToAlert7 = coursesToAlert.filter(
      (course) => course.daysUntilCourseEnd < 7
    );

    // Notificar los cursos aun no estan creados
    for (const course of coursesToCreate) {
      const courseEndDate = new Date(course.endDate.split("T")[0]);
      const formattedEndDate = courseEndDate.toISOString().split("T")[0];
      const daysUntilCourseEnd = Math.ceil(
        (courseEndDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      // Mostrar detalles del curso
      console.log(
        `Course ending soon: ${course.name}\nEnd Date: ${formattedEndDate}\nDays until course end: ${daysUntilCourseEnd}\n`
      );

      const participants = course.participants;

      let surveyResponse_teacher;

      try {
        surveyResponse_teacher = await axios.post(
          "http://mongo_api:5050/api/survey/create-teacher-survey",
          {
            courseId: course._id,
            participants: participantIds,
          }
        );
        console.log(
          `Food survey created for class ${classItem.name} with id ${surveyResponse_teacher.data.surveyId}`
        );
      } catch (error) {
        console.error("Error creating food survey:", error);
      }

      let notificationIds = [];

      // send a post request to the mongoapi to create a notification for each instructor
      for (const participant of participants) {
        const notification = {
          recipient: participant,
          type: "Info",
          subject: `Course ${course.name} is ending soon`,
          content: `Reminder: Your course ${course.name} is ending on ${formattedEndDate}. Here is the link for the teacher survey: ${process.env.FRONTEND_URL}/teacher-survey/${course._id}/${participant}/${surveyResponse_teacher.data.surveyId}`,
          courseId: course._id,
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
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

        // Change the alertedTeacher field to true
        try {
          const updateResponse = await axios.put(
            `http://mongo_api:5050/api/courses/update/${course._id}`,
            {
              alertedTeacher: true,
            }
          );
          console.log(
            `Alerted teacher for course ${course.name} with response: ${updateResponse.data.message}`
          );
        } catch (error) {
          console.error("Error updating course:", error);
        }
      } catch (error) {
        console.error("Error sending notifications:", error);
      }
    }

    //
  } catch (error) {
    console.error("Error checking for end of courses:", error);
  }
  const updateWeekNumberForCourses = async (courses, weekNumber) => {
    for (const course of courses) {
      try {
        // Get the survey teacher IDs for the course
        const surveyTeacherResponse = await axios.get(
          `http://mongo_api:5050/api/survey/get-teacher-survey/${course._id}`
        );
        const surveyId = surveyTeacherResponse.data.surveyId;

        // Update the weekNumber field for the teacher survey
        const updateResponse = await axios.put(
          `http://mongo_api:5050/api/survey/update/${surveyId}`,
          {
            weekNumber,
          }
        );
      } catch (error) {
        console.error("Error updating weekNumber:", error);
      }
    }
  };

  // Update weekNumber for each group of courses
  await updateWeekNumberForCourses(coursesToAlert21, 1);
  await updateWeekNumberForCourses(coursesToAlert14, 2);
  await updateWeekNumberForCourses(coursesToAlert7, 3);
  await updateWeekNumberForCourses(mustCloseCourses, 4);
};

const sendTeacherSurveyReminders = async (weekNumber) => {
  try {
    const response = await axios.get(
      "http://mongo_api:5050/api/survey/get-all-teacher-surveys"
    );
    const surveys = response.data.data;

    // Filter the surveys with weekNumber equal to 3
    const surveysToRemind = surveys.filter(
      (survey) => survey.weekNumber === weekNumber
    );

    // Send a notification to the participants of each survey
    for (const survey of surveysToRemind) {
      const participants = survey.participantsNotAnswered;

      let notificationIds = [];

      // send a post request to the mongoapi to create a notification for each participant
      for (const participant of participants) {
        const notification = {
          recipient: participant,
          type: "Info",
          subject: `Teacher survey reminder`,
          content: `Reminder: Please fill out the teacher survey for course ${survey.courseId}. Your link is: ${process.env.FRONTEND_URL}/teacher-survey/${survey.courseId}/${participant}/${survey._id}`,
          courseId: survey.courseId,
        };
        const response = await axios.post(
          "http://mongo_api:5050/api/notifications/",
          notification
        );
        notificationIds.push(response.data.data._id);
      }

      try {
        // Get the id of the notification created
        for (const notificationId of notificationIds) {
          const notificationSentResponse = await axios.post(
            "http://notifications_api:9090/notifications",
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
    console.error("Error sending teacher survey reminders:", error);
  }
};

module.exports = {
  checkForUpcomingClasses,
  checkForUpcomingCourses,
  checkForEndOfCourses,
  sendTeacherSurveyReminders,
};
