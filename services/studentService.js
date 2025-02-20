const mongoose = require('mongoose');
const Student = require('../models/student');
const sseService = require('./sseService');

const sendTelegramNotification = async function (message) {
  console.log("Function: sendTelegramNotification");
  console.log("Message:", message);
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Telegram message sent:', data.result.text);
    } else {
      console.error('Error sending Telegram message:', data.description);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
};



const checkAccessToken = (req, res, next) => {
  const token = req.headers["access-token"];
  console.log("Checking access token:", token);
  if (!token) {
    console.log("Access token is missing");
    return res.status(401).json({ error: "Access token is missing" });
  }
  if (token !== VALID_ACCESS_TOKEN) {
    console.log("Invalid access token");
    return res.status(403).json({ error: "Invalid access token" });
  }
  console.log("Access token is valid");
  next();
};

const getAttendanceByDate = async (req, res) => {
  console.log("Endpoint: POST /attendance/date");
  console.log("Request body:", req.body); // Log the request body
  try {
    if (req.body.date) {
      console.log("Date provided in request body:", req.body.date);
      const dateToSearch = req.body.date;
      console.log("Date to search:", dateToSearch);
      // Use $in operator to find students whose dates array contains the dateToSearch
      const query = { dates: { $in: [dateToSearch] } };
      console.log("Mongoose query:", query);
      const attendanceForDate = await Student.find(query);
      if (!attendanceForDate || attendanceForDate.length === 0) {
        console.log("No attendance data found for the date.");
        return res.status(204).send(); // Use 204 No Content for no data found
      }
      // Remove the 'dates' field from each student object in the response
      const studentsToSend = attendanceForDate.map(student => {
        const studentObject = student.toObject(); // Convert Mongoose document to plain JavaScript object
        delete studentObject.dates;
        return studentObject;
      });
      // console.log("Attendance data found for the date:", attendanceForDate);
      res.json(attendanceForDate);
    } else {
      console.log("No date provided in request body. Returning all students with limited dates.");
      const students = await Student.find({});
      const limitedStudents = students.map((student) => {
        student.dates = student.dates.slice(-5);
        return student;
      });
      // console.log("Returning students:", limitedStudents);
      res.json(limitedStudents);
    }
  } catch (error) {
    console.error("Error getting attendance by date:", error);
    return res.status(500).json({ error: "Failed to retrieve attendance data." });
  }
};

const getStudentById = async (req, res) => {
  console.log("Endpoint: GET /:_id");
  try {
    const studentId = req.params._id;
    console.log("Student ID:", studentId);
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("Student data:", student);
    res.json(student);
  } catch (error) {
    console.error("Error getting student by ID:", error);
    return res.status(500).json({ error: "Failed to retrieve student data." });
  }
};

const createStudent = async (req, res) => {
  console.log("Endpoint: POST /");
  try {
    const newStudent = req.body;
    console.log("New student data:", newStudent);

    // Fetch the last student to get the last ID
    const lastStudent = await Student.findOne().sort({ _id: -1 });
    const nextStudentId = (lastStudent?._id || 0) + 1;
    newStudent._id = nextStudentId;


    const createdStudent = await Student.create(newStudent);
    console.log("New student added successfully.");
    res.status(201).json({ message: "Student added successfully", student: createdStudent });
  } catch (error) {
    console.error("Error creating student:", error);
    return res.status(500).json({ error: "Failed to create student." });
  }
};

const updateStudent = async (req, res) => {
  console.log("Endpoint: PUT /:_id");
  try {
    const studentId = req.params._id;
    console.log("Student ID:", studentId);
    const updateBody = req.body;
    console.log("Update body:", updateBody);
    const updatedStudent = await Student.findOneAndUpdate({ _id: studentId }, updateBody, { new: true });
    if (!updatedStudent) {
      console.log("Student not found");
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("Student updated successfully");
    res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ error: "Failed to update student." });
  }
};

const deleteStudent = async (req, res) => {
  console.log("Endpoint: DELETE /:_id");
  try {
    const studentId = req.params._id;
    console.log("Student ID:", studentId);
    const deletedStudent = await Student.findOneAndDelete({ _id: studentId });
    if (!deletedStudent) {
      console.log("Student not found");
      return res.status(404).json({ error: "Student not found" });
    }
    console.log("Student deleted successfully");
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ error: "Failed to delete student." });
  }
};

const updateAttendance = async (req, res) => {
  console.log("Endpoint: POST /attendance");
  try {
    const { date, Ids } = req.body;
    console.log("Date:", date);
    console.log("IDs:", Ids);

    for (const studentId of Ids) {
      const student = await Student.findOneAndUpdate(
        { _id: studentId },
        {
          $inc: { total: 1 },
          $push: { dates: date },
        },
        { new: true }
      );

      if (!student) {
        console.log(`Student with ID ${studentId} not found`);
        return res.status(404).json({ error: `Student with ID ${studentId} not found` });
      }

      student.consecutiveCount = student.total % 4;
      if (student.consecutiveCount === 0) {
        student.streakOfFour++;
        sendTelegramNotification(`Student ${student.name} (Id:${student._id}) has a streak of four! call: ${student.phone}`);

        // Send SSE notification using sseService
        const notificationMessage = {
          studentId: student._id,
          studentName: student.name,
          message: `Student ${student.name} (ID: ${student._id}) has completed a streak!`,
        };
        sseService.broadcastNotification(notificationMessage);
      }
      await student.save();
    }

    console.log("Attendance updated successfully.");
    res.status(201).json({ message: "Attendance updated successfully" });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ error: "Failed to update attendance." });
  }
};

const resetAttendance = async (req, res) => {
  console.log("Endpoint: DELETE /attendance");
  try {
    await Student.updateMany({}, {
      total: 0,
      consecutiveCount: 0,
      streakOfFour: 0,
      dates: [],
    });
    console.log("Attendance reset successfully.");
    res.status(200).json({ message: "Attendance reset successfully." });
  } catch (error) {
    console.error("Error resetting attendance:", error);
    return res.status(500).json({ error: "Failed to reset attendance." });
  }
};

const deleteAllStudents = async (req, res) => {
  console.log("Endpoint: DELETE / (all students)");
  try {
    await Student.deleteMany({});
    console.log("All students deleted successfully.");
    res.status(200).json({ message: "All students deleted successfully." });
  } catch (error) {
    console.error("Error deleting all students:", error);
    res.status(500).json({ error: "Failed to delete all students." });
  }
};

const getBackupData = async (req, res) => {
  console.log("Endpoint: GET /attendance/backup");
  try {
    const data = await Student.find({});
    // console.log("Backup data:", data);
    res.json(data);
  } catch (error) {
    console.error("Error getting backup data:", error);
    return res.status(500).json({ error: "Failed to retrieve backup data." });
  }
};

module.exports = {
  sendTelegramNotification,
  checkAccessToken,
  getAttendanceByDate,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateAttendance,
  resetAttendance,
  deleteAllStudents,
  getBackupData,
};
