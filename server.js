const express = require("express");
const cors = require("cors");
const path = require("path"); // Import the path module
const studentRoutes = require("./routers/student");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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

// Use the student routes
app.use(studentRoutes);

app.listen(port, () => {
  console.log("App listening on port:", port);
});
