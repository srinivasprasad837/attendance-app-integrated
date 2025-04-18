import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box
} from "@mui/material";
import studentService from "../services/studentService";
import { useContext } from "react";
import { NotificationContext } from "../NotificationContext";
import useErrorHandler from "../hooks/useErrorHandler";
import "./View.css";
import { Button } from "@mui/material";

const maxDate = format(new Date(), "yyyy-MM-dd");

function View() {
  const { showNotification } = useContext(NotificationContext);
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [students, setStudents] = useState([]);

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleUndoAttendance = async (studentId, date) => {
    setIsLoading(true);
    try {
      const updatedStudent = await studentService.removeAttendance(
        studentId,
        format(date, "yyyy-MM-dd")
      );
      if (updatedStudent && updatedStudent.student) {
            showNotification("Attendance removed successfully");
            fetchStudents(); // Reload student list after undo
          } else {
            showNotification("Error removing attendance");
          }
        } catch (error) {
          handleError(error);
        } finally {
          setIsLoading(false);
        }
      };

      const fetchStudents = async () => {
        setIsLoading(true)
        try {
          const response = await studentService.getStudents(format(selectedDate, "yyyy-MM-dd"));
          setStudents(response);
        } catch (error) {
          handleError(error);
        } finally {
          setIsLoading(false)
        }
      };

  useEffect(() => {
    fetchStudents();
  }, [selectedDate]);

  return (
    <div className="view-container">
      <h1>View Attendance</h1>
      {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress />
                </Box>
              )}
      <TextField
        type="date"
        value={format(selectedDate, "yyyy-MM-dd")}
        onChange={handleDateChange}
        variant="outlined"
        sx={{ mb: 2, width: "100%" }}
        slotProps={{
          input: {
            onClick: (e) => e.target.showPicker(),
            max: maxDate,
          },
        }}
      />

      {students.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Total Attendance</TableCell>
                <TableCell>Consecutive Classes</TableCell>
                <TableCell>Streak Of 4</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((record) => {
                return (
                  <TableRow key={record._id}>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record._id}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell>{record.consecutiveCount}</TableCell>
                    <TableCell>{record.streakOfFour}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() =>
                          handleUndoAttendance(record._id, selectedDate)
                        }
                      >
                        Undo
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <h4>No Attendance taken for this date</h4>
      )}
    </div>
  );
}

export default View;
