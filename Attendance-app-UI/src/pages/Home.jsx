import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import axios from "axios";
import config from "../config";

import {
  TextField,
  Button,
  Pagination,
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  InputAdornment,
} from "@mui/material";
import { NotificationContext } from "../NotificationContext";
import SearchIcon from "@mui/icons-material/Search";
import "./Home.css";

function Home() {
  const { setNotification, setOpen, setSeverity } = useContext(
    NotificationContext
  );
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState([]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const studentsPerPage = 5;

  const fetchStudents = async () => {
    try {
      const response = await axios.post(
        `${config.baseURL}/student/attendance/date`, {
          validateStatus: function (status) {
            return status >= 200 && status < 300; // Resolve only if the status code is in the 200s
          }
        }
      );

      if (response.status !== 200) {
        // If the API call fails, extract the error message from the response
        setNotification(response.data.error || "Failed to fetch students");
        setOpen(true);
        setSeverity("error");
        return;
      }

      setStudents(response.data);
    } catch (error) {
      // If there's an error during the API call (e.g., network error), display a generic error message
      console.error("Error fetching students:", error);
      let errorMessage = "Failed to fetch students.";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else {
        errorMessage += ` ${error.message}`;
      }
      setNotification(errorMessage);
      setOpen(true);
      setSeverity("error");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSelectStudent = (event, studentId) => {
    if (event.target.checked) {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    } else {
      setSelectedStudentIds(
        selectedStudentIds.filter((id) => id !== studentId)
      );
    }
  };

  const handleMarkAttendance = async () => {
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const formattedDate = selectedDate;

    const response = await axios.post(
      `${config.baseURL}/student/attendance`,
      { date: formattedDate, Ids: selectedStudentIds }
    );
    if (response.status === 201) {
      setOpen(true);
      setNotification("Attendance for selected students marked successfully!");
      setSeverity("success");
    }
    setSelectedStudentIds([]);
    fetchStudents();
  };

  return (
    <div className="home-container">
      <Container
        className="home-container-inner"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Add Attendance</h1>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleMarkAttendance}
          disabled={selectedStudentIds.length === 0}
          size="medium"
        >
          Mark Attendance
        </Button>
      </Container>

      <TextField
        label="Search students..."
        variant="outlined"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 2, width: "100%" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Total Attendance</TableCell>
              <TableCell>Consecutive classes</TableCell>
              <TableCell>Streak Of 4</TableCell>
              <TableCell>Last 5 Classes</TableCell>
              <TableCell>Last Paid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    edge="end"
                    onChange={(event) => handleSelectStudent(event, student._id)}
                    checked={selectedStudentIds.includes(student._id)}
                  />
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student._id}</TableCell>
                <TableCell>{student.selectedClass}</TableCell>
                <TableCell>{student.total}</TableCell>
                <TableCell>{student.consecutiveCount}</TableCell>
                <TableCell>{student.streakOfFour}</TableCell>
                <TableCell>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {student.dates.map((date, index) => (
                      <div key={index} style={{ display: "block" }}>
                        {format(new Date(date), "dd/MM/yyyy")}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {student.lastPaidDate
                    ? format(new Date(student.lastPaidDate), "dd/MM/yyyy")
                    : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </div>
  );
}

export default Home;
