const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // Import the path module
const studentRoutes = require("./routers/student");
const settingsRouter =require("./routers/settings");

dotenv.config();

const app = express();
const port = 3001;

console.log(`mongo uri: ${process.env.MONGODB_URI}`)
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

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
// Use the settings routes
app.use(settingsRouter);

app.listen(port, () => {
  console.log("App listening on port:", port);
});
