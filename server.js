const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path"); // Import the path module

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
console.log("Middleware: express.json() and cors() are being used.");

const dataFile = "./data.json";

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

// Helper function to read data from the JSON file
const readData = () => {
  console.log("Function: readData");
  try {
    if (!fs.existsSync(dataFile)) {
      console.log("Data file does not exist. Creating a new one.");
      fs.writeFileSync(dataFile, JSON.stringify({ students: [] }, null, 2));
    }
    const rawData = fs.readFileSync(dataFile, "utf-8");
    console.log("Raw data read from file:", rawData);
    const parsedData = JSON.parse(rawData);
    console.log("Parsed data:", parsedData);
    return parsedData;
  } catch (error) {
    // If the file doesn't exist or is invalid, return default data
    console.error("Error reading data.json:", error);
    return { students: [] };
  }
};

// Helper function to write data to the JSON file
const writeData = (data) => {
  console.log("Function: writeData");
  console.log("Data to write:", data);
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Access token from environment variables or use a default value
let VALID_ACCESS_TOKEN = process.env.VALID_ACCESS_TOKEN;

if (!VALID_ACCESS_TOKEN) {
    // If the environment variable is not set, use a default value
    VALID_ACCESS_TOKEN = "myToken";
}

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

// API base path
const apiBasePath = "/api/v1/student";

app.post(`${apiBasePath}/attendance/date`, [checkAccessToken], (req, res) => {
  console.log("Endpoint: POST /attendance/date");
  let { students } = readData();
  if (req.body.date) {
    console.log("Date provided in request body:", req.body.date);
    const attendanceForDate = students.filter((student) =>
      student.dates.includes(req.body.date)
    );
    attendanceForDate.forEach((student) => {
      delete student.dates;
    });
    if (!attendanceForDate) {
      console.log("No attendance data found for the date.");
      return res.status(204).send();
    }
    console.log("Attendance data found for the date:", attendanceForDate);
    res.json(attendanceForDate);
  } else {
    console.log("No date provided in request body. Returning all students with limited dates.");
    students = students.map((student) => {
      student.dates = student.dates.slice(-4);
      return student;
    });
    console.log("Returning students:", students);
    res.json(students);
  }
});

app.get(`${apiBasePath}/:id`, checkAccessToken, (req, res) => {
  console.log("Endpoint: GET /:id");
  let { students } = readData();
  const studentId = parseInt(req.params.id);
  console.log("Student ID:", studentId);
  const studentData = students.find((student) => student.id === studentId);
  const student = {
    id: studentData.id,
    name: studentData.name,
    email: studentData.email,
    phone: studentData.phone,
  };
  console.log("Student data:", student);
  res.json(student);
});

app.post(`${apiBasePath}`, checkAccessToken, (req, res) => {
  console.log("Endpoint: POST /");
  const newStudent = req.body;
  console.log("New student data:", newStudent);
  let { students } = readData();
  if (
    students.some(
      (student) =>
        student.email === newStudent.email || student.phone === newStudent.phone
    )
  ) {
    console.log("Student with this email or phone number already exists!");
    return res
      .status(400)
      .send("Student with this email or phone number already exists!");
  }
  newStudent.id =
    students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
  newStudent.total = 0;
  newStudent.consecutiveCount = 0;
  newStudent.streakOfFour = 0;
  newStudent.dates = [];
  newStudent.paidDates = "";
  students.push(newStudent);
  writeData({ students });
  console.log("New student added successfully.");
  res.status(201).send();
});

app.put(`${apiBasePath}/:id`, checkAccessToken, (req, res) => {
  console.log("Endpoint: PUT /:id");
  let { students } = readData();
  const studentId = parseInt(req.params.id);
  console.log("Student ID:", studentId);
  const updateBody = req.body;
   console.log("Update body:", updateBody);
  students = students.map((student) => {
    if (student.id === studentId) {
      student.name = updateBody.name;
      student.email = updateBody.email;
      student.phone = updateBody.phone;
      if (updateBody.lastPaidDate !== student.lastPaidDate)
        student.lastPaidDate = updateBody.lastPaidDate;
    }
    return student;
  });
  writeData({ students });
  res.json(updateBody);
});

app.delete(`${apiBasePath}/:id`, checkAccessToken, (req, res) => {
  console.log("Endpoint: DELETE /:id");
  let { students } = readData();
  const studentId = parseInt(req.params.id);
  console.log("Student ID:", studentId);
  students = students.filter((student) => student.id !== studentId);
  writeData({ students });
  res.status(204).send();
});

app.post(`${apiBasePath}/attendance`, checkAccessToken, (req, res) => {
  console.log("Endpoint: POST /attendance");
  let { date, Ids } = req.body;
  console.log("Date:", date);
  console.log("IDs:", Ids);
  let { students } = readData();

  students = students.map((student) => {
    if (Ids.includes(student.id)) {
      student.total++;
      student.consecutiveCount = student.total % 4;
      if (student.consecutiveCount === 0) {
        student.streakOfFour++;
        sendTelegramNotification(`Student ${student.name} (${student.id}) has a streak of four!`);
      }
      student.dates.push(date);
    }
    return student;
  });

  writeData({ students });
  console.log("Attendance updated successfully.");

  res.status(201).send();
});

app.delete(`${apiBasePath}/attendance`, checkAccessToken, (req, res) => {
  console.log("Endpoint: DELETE /attendance");
  students = readData();
  students = students.map((student) => {
    student.total = 0;
    student.consecutiveCount = 0;
    student.streakOfFour = 0;
    student.dates = [];
    return student;
  });
  writeData({ students });
  res.status(200).send();
});

app.delete(`${apiBasePath}`, checkAccessToken, (req, res) => {
  console.log("Endpoint: DELETE / (all students)");
  writeData({ students: [] });
  res.status(200).send();
});

//New endpoints for backup
app.get(`${apiBasePath}/attendance/backup`, checkAccessToken, (req, res) => {
  console.log("Endpoint: GET /attendance/backup");
  const data = readData();
  console.log("Backup data:", data);
  res.json(data);
});

// app.post(`${apiBasePath}/attendance/backup`, checkAccessToken, (req, res) => {
//   const backupData = req.body;
//   writeData(backupData);
//   res.status(200).send("Backup data uploaded successfully.");
// });

// Serve static files from a "public" directory
app.use('/student', express.static(path.join(__dirname, 'public')));

// This route serves any file under public
app.get("/student/*", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.params[0]));
});

// Redirect to the student page
app.get("/", (req, res) => {
  res.status(301).redirect("/student/");
});

app.listen(port, () => {
  console.log("App listening on port:", port);
});
