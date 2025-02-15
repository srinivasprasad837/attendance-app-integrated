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
} from "@mui/material";
import axios from "axios";
import config from "../config";
import { useContext } from "react";
import { NotificationContext } from "../NotificationContext";
import "./View.css";

const maxDate = format(new Date(), "yyyy-MM-dd");

function View() {
  const { setNotification, setOpen, setSeverity } = useContext(NotificationContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [students, setStudents] = useState([]);

  const handleDateChange = (event) =>{
    setSelectedDate(new Date(event.target.value));
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.post(
          `${config.baseURL}/student/attendance/date`,
          {
            date: format(selectedDate, "yyyy-MM-dd"),
          }
        );
        setStudents(response.data);
      } catch (error) {
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
    fetchStudents();
  }, [selectedDate, setNotification, setOpen, setSeverity]);

  return (
    <div className="view-container">
      <h1>View Attendance</h1>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((record) => {
                return (
                  <TableRow key={record.id}>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.total}</TableCell>
                    <TableCell>{record.consecutiveCount}</TableCell>
                    <TableCell>{record.streakOfFour}</TableCell>
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
