const express = require("express");
const router = express.Router();
const studentService = require("../services/studentService");
const utilityService = require('../utilities/utilityService');

// Middleware
const checkAccessToken = utilityService.checkAccessToken;

// API base path
const apiBasePath = "/api/v1/student";

router.post(
  `${apiBasePath}/attendance/date`,
  [checkAccessToken],
  studentService.getAttendanceByDate
);

router.get(
  `${apiBasePath}/:_id`,
  [checkAccessToken],
  studentService.getStudentById
);

router.post(
  `${apiBasePath}`, 
  [checkAccessToken], 
  studentService.createStudent
);

router.put(
  `${apiBasePath}/:_id`, 
  [checkAccessToken], 
  studentService.updateStudent
);

router.delete(
  `${apiBasePath}/:_id`,
  [checkAccessToken],
  studentService.deleteStudent
);

router.post(
  `${apiBasePath}/attendance`,
  [checkAccessToken],
  studentService.updateAttendance
);

router.delete(
  `${apiBasePath}/attendance`,
  [checkAccessToken],
  studentService.resetAttendance
);

router.delete(
  `${apiBasePath}/attendance/:_id/:date`,
  [checkAccessToken],
  studentService.removeAttendanceByDate
);

router.delete(
  `${apiBasePath}`,
  [checkAccessToken],
  studentService.deleteAllStudents
);

router.get(
  `${apiBasePath}/attendance/backup`,
  [checkAccessToken],
  studentService.getBackupData
);

module.exports = router;
