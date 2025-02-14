const express = require("express");
const router = express.Router();
const studentService = require("../services/studentService");

// Middleware
const checkAccessToken = studentService.checkAccessToken;

// API base path
const apiBasePath = "/api/v1/student";

router.post(`${apiBasePath}/attendance/date`, [checkAccessToken], studentService.getAttendanceByDate);

router.get(`${apiBasePath}/:id`, checkAccessToken, studentService.getStudentById);

router.post(`${apiBasePath}`, checkAccessToken, studentService.createStudent);

router.put(`${apiBasePath}/:id`, checkAccessToken, studentService.updateStudent);

router.delete(`${apiBasePath}/:id`, checkAccessToken, studentService.deleteStudent);

router.post(`${apiBasePath}/attendance`, checkAccessToken, studentService.updateAttendance);

router.delete(`${apiBasePath}/attendance`, checkAccessToken, studentService.resetAttendance);

router.delete(`${apiBasePath}`, checkAccessToken, studentService.deleteAllStudents);

router.get(`${apiBasePath}/attendance/backup`, checkAccessToken, studentService.getBackupData);

module.exports = router;
