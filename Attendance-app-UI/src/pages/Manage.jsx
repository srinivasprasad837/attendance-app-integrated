import React, {
      useState,
      useEffect,
      useRef,
      useContext,
      useCallback,
      useMemo,
    } from "react";
    import axios from "axios";
    import { format } from "date-fns";
    import config from "../config";
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
    } from "@mui/material";

    import EditIcon from "@mui/icons-material/Edit";
    import DeleteIcon from "@mui/icons-material/Delete";

    import { NotificationContext } from "../NotificationContext";

    const modalStyle = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
    };

    function Manage() {
      const { setNotification, setOpen } = useContext(NotificationContext);
      const [studentId, setStudentId] = useState("");
      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [phone, setPhone] = useState("");
      const [isEditing, setIsEditing] = useState(false);
      const [editStudentId, setEditStudentId] = useState("");
      const [students, setStudents] = useState([]);
      const [searchQuery, setSearchQuery] = useState("");
      const [currentPage, setCurrentPage] = useState(1);
      const [lastPaidDate, setLastPaidDate] = useState("");
      const [isLoading, setIsLoading] = useState(false);
      const [modalOpen, setModalOpen] = useState(false);
      const [deleteStudent, setDeleteStudent] = useState(null);
      const studentsPerPage = 5;

      const formRef = useRef(null);
      const maxDate = new Date();

      useEffect(() => {
        fetchStudents();
      }, []);

      useEffect(() => {
        if (!name && !email && !phone && !lastPaidDate) {
          setIsEditing(false);
          setEditStudentId("");
        }
      }, [name, email, phone, lastPaidDate]);

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
        const student = students.find((student) => student.id === id);
        if (student) {
          setStudentId(student.id);
          setName(student.name);
          setEmail(student.email);
          setPhone(student.phone);
          setLastPaidDate(
            student.lastPaidDate
              ? format(new Date(student.lastPaidDate), "yyyy-MM-dd")
              : ""
          );
        }
      };

      const clearFields = useCallback(() => {
        setStudentId("");
        setEditStudentId("");
        setName("");
        setEmail("");
        setPhone("");
        setLastPaidDate("");
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
          const response = await axios.post(
            `${config.baseURL}/student/attendance/date`
          );
          setStudents(response.data);
        } catch (error) {
          console.error("Error fetching students:", error);
          setNotification("Error fetching students");
          setOpen(true);
        } finally {
          setIsLoading(false);
        }
      };

      const handleDelete = async (studentId) => {
        setIsLoading(true);
        try {
          await axios.delete(`${config.baseURL}/student/${studentId}`);
          setNotification("Student deleted successfully");
          setOpen(true);
          fetchStudents();
        } catch (error) {
          console.error("Error deleting student:", error);
          setNotification("Error deleting student");
          setOpen(true);
        } finally {
          setIsLoading(false);
        }
      };

      const handleUpdate = async (studentId) => {
        setIsLoading(true);
        try {
          await axios.put(`${config.baseURL}/student/${studentId}`, {
            name,
            email,
            phone,
            lastPaidDate,
          });
          setNotification("Student updated successfully");
          setOpen(true);
          clearFields();
          fetchStudents();
          setIsEditing(false);
          setEditStudentId("");
        } catch (error) {
          console.error("Error updating student:", error);
          setNotification("Error updating student");
          setOpen(true);
        } finally {
          setIsLoading(false);
        }
      };

      const handleAdd = async () => {
        setIsLoading(true);
        try {
          await axios.post(`${config.baseURL}/students`, {
            name,
            email,
            phone,
          });
          setNotification("Student added successfully");
          setOpen(true);
          clearFields();
          fetchStudents();
        } catch (error) {
          console.error("Error adding student:", error);
          setNotification("Error adding student");
          setOpen(true);
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
        <div style={{ padding: "16px" }}>
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
            sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}
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
              required
            />
            <TextField
              label="Phone"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
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
              sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  width: "100%",
                }}
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
                key={student.id}
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
                      Student Id: {student.id}
                    </Typography>
                    <Typography variant="h5">{student.name}</Typography>
                  </CardContent>
                  <CardActions sx={{ marginRight: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      size="medium"
                      onClick={() => handleEdit(student.id)}
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
              <Box sx={modalStyle}>
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
                          handleDelete(deleteStudent.id);
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
        </div>
      );
    }

    export default Manage;
