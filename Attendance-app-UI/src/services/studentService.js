import axios from "../axios";
import config from "../config";

const getStudents = async (date) => {
  try {
    const response = await axios.post(`${config.baseURL}/student/attendance/date`, { date });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const markAttendance = async (date, Ids) => {
  try {
    const response = await axios.post(`${config.baseURL}/student/attendance`, { date, Ids });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addStudent = async (student) => {
  try {
    const response = await axios.post(`${config.baseURL}/student`, student);
    return response;
  } catch (error) {
    throw error;
  }
};

const updateStudent = async (id, student) => {
  try {
    const response = await axios.put(`${config.baseURL}/student/${id}`, student);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteStudent = async (id) => {
  try {
    await axios.delete(`${config.baseURL}/student/${id}`);
  } catch (error) {
    throw error;
  }
};

export default {
  getStudents,
  markAttendance,
  addStudent,
  updateStudent,
  deleteStudent,
};
