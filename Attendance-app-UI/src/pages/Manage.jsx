import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { format } from "date-fns";
import studentService from "../services/studentService";
import {
  TextField,
  Button,
  List,
  ListItem,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Pagination,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  MenuItem,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { NotificationContext } from "../NotificationContext";
import useErrorHandler from "../hooks/useErrorHandler";
import "./Manage.css";
import settingsService from "../services/settingsService";

function Manage() {
  const { showNotification } =
    useContext(NotificationContext);
  const { handleError } = useErrorHandler();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPaidDate, setLastPaidDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const studentsPerPage = 5;

  const formRef = useRef(null);
  const maxDate = new Date();

  useEffect(() => {
    fetchDropdownOptions();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!name && !email && !phone && !lastPaidDate) {
      setIsEditing(false);
      setEditStudentId("");
    }
  }, [name, email, phone, lastPaidDate]);


  const fetchDropdownOptions = async () => {
    try {
      const response = await settingsService.getDropdownOptions();
      setDropdownOptions(response);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (editStudentId) {
      fetchStudentDetails(editStudentId);
    }
  }, [editStudentId]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setCurrentPage(value);
  }, []);

  const fetchStudentDetails = (id) => {
    const student = students.find((student) => student._id === id);
    if (student) {
      setStudentId(student._id);
      setName(student.name);
      setEmail(student.email);
      setPhone(student.phone);
      setLastPaidDate(
        student.lastPaidDate
          ? format(new Date(student.lastPaidDate), "yyyy-MM-dd")
          : ""
      );
      setSelectedClass(student.selectedClass);
    }
  };

  const clearFields = useCallback(() => {
    setStudentId("");
    setEditStudentId("");
    setName("");
    setEmail("");
    setPhone("");
    setLastPaidDate("");
    setSelectedClass("");
    setIsEditing(false);
  }, []);

  const handleEdit = useCallback(
    (id) => {
      setIsEditing(true);
      setEditStudentId(id);
      fetchStudentDetails(id);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },
    [students]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isEditing) {
      await handleUpdate(editStudentId);
    } else {
      await handleAdd();
    }
  };

  const handleDateChange = (event) => {
    setLastPaidDate(event.target.value);
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getStudents();
      setStudents(response);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    setIsLoading(true);
    try {
      await studentService.deleteStudent(studentId);
      showNotification("Student deleted successfully", "success");
      fetchStudents();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (studentId) => {
    setIsLoading(true);
    try {
      await studentService.updateStudent(studentId, {
        name,
        email,
        phone,
        selectedClass,
        lastPaidDate,
      });
      showNotification("Student updated successfully", "success");
      clearFields();
      fetchStudents();
      setIsEditing(false);
      setEditStudentId("");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.addStudent({
        name,
        email,
        phone,
        selectedClass,
      });
      if (response.status !== 201) {
        showNotification(response.data.error || "Error adding student", "error");
        return;
      }
      showNotification("Student added successfully", "success");
      clearFields();
      fetchStudents();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = useCallback((student) => {
    setDeleteStudent(student);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDeleteStudent(null);
    setModalOpen(false);
  }, []);

  return (
    <div className="manage-container">
      <h1>Manage Students</h1>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Box
        ref={formRef}
        component="form"
        onSubmit={handleSubmit}
        className="form-container"
      >
        {isEditing && <h3>Student Id: {studentId}</h3>}
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Phone"
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <TextField
          select
          label="Class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          variant="outlined"
          required
        >
          {dropdownOptions.map((option, index) => (
            <MenuItem key={index} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        {isEditing && (
          <>
            <Typography sx={{ margin: 0 }}>Update Paid Date</Typography>
            <TextField
              type="date"
              value={lastPaidDate}
              onChange={handleDateChange}
              variant="outlined"
              sx={{ mb: 2, width: "100%" }}
              inputProps={{
                max: format(maxDate, "yyyy-MM-dd"),
              }}
            />
          </>
        )}
        <Box
          className="form-actions"
        >
          <div
            className="form-actions-inner"
          >
            <Button
              type="button"
              variant="contained"
              size="medium"
              color="primary"
              onClick={clearFields}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              color="primary"
              sx={{ width: "20%", marginRight: 0 }}
            >
              {isEditing ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </Box>
      </Box>

      <TextField
        label="Search students..."
        variant="outlined"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 2, width: "100%" }}
      />

      <List>
        {currentStudents.map((student) => (
          <ListItem
            key={student._id}
            sx={{ display: "flex", justifyContent: "center", padding: 0 }}
          >
            <Card
              sx={{
                marginBottom: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: 2,
                width: "80%",
              }}
            >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ marginBottom: 2 }}
              >
                Student Id: {student._id}
              </Typography>
              <Typography variant="h5">{student.name}</Typography>
            </CardContent>
            <CardActions sx={{ marginRight: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                size="medium"
                onClick={() => handleEdit(student._id)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                size="medium"
                onClick={() => handleOpenModal(student)}
                color="error"
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </ListItem>
      ))}
    </List>

    <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
      />
    </Box>

    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={modalOpen}
      onClose={handleCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={modalOpen}>
        <Box className="modal-style">
          {deleteStudent && (
            <>
              <Typography
                id="transition-modal-description"
                color="error"
                sx={{ mt: 0.5 }}
              >
                Are you sure you want to delete the student{" "}
                {deleteStudent.name}?
              </Typography>
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  size="medium"
                  onClick={() => {
                    handleDelete(deleteStudent._id);
                    handleCloseModal();
                  }}
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Modal>
    </div >
  );
}

export default Manage;
