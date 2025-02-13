import React, { useState, useEffect, useContext } from "react";
    import { format } from "date-fns";
    import axios from "../axios";
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

    function Home() {
      const { setNotification, setOpen } = useContext(NotificationContext);
      const [students, setStudents] = useState([]);
      const [searchQuery, setSearchQuery] = useState("");
      const [currentPage, setCurrentPage] = useState(1);
      const [selectedStudentIds, setSelectedStudentIds] = useState([]);

      const studentsPerPage = 5;

      const fetchStudents = async () => {
        try {
          const students = await axios.post(
            `${config.baseURL}/student/attendance/date`
          );
          setStudents(students.data);
        } catch (error) {
          console.error("Error fetching students:", error);
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

        const today = new Date();
        const formattedDate = format(today, "yyyy-MM-dd");

        const response = await axios.post(
          `${config.baseURL}/student/attendance`,
          { date: formattedDate, Ids: selectedStudentIds }
        );
        if (response.status === 201) {
          setOpen(true);
          setNotification("Attendance for selected students marked successfully!");
        }
        setSelectedStudentIds([]);
        fetchStudents();
      };

      return (
        <div style={{ padding: "16px" }}>
          <Container
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>Add Attendance</h1>
            <Button
              variant="contained"
              color="secondary"
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
                  <TableCell>Total Attendance</TableCell>
                  <TableCell>Consecutive classes</TableCell>
                  <TableCell>Streak Of 4</TableCell>
                  <TableCell>Last 4 Classes</TableCell>
                  <TableCell>Last Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        edge="end"
                        onChange={(event) => handleSelectStudent(event, student.id)}
                        checked={selectedStudentIds.includes(student.id)}
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.total}</TableCell>
                    <TableCell>{student.consecutiveCount}</TableCell>
                    <TableCell>{student.streakOfFour}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {student.dates
                          .map((date) => format(new Date(date), "dd/MM/yyyy"))
                          .join(", ")}
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
