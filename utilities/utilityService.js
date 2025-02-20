const dotenv = require("dotenv");
dotenv.config();
console.log(process.env)
// Access token from environment variables or use a default value
const VALID_ACCESS_TOKEN = process.env.VALID_ACCESS_TOKEN;
// const VALID_ACCESS_TOKEN = '1234567890';

//if access token is not provided in environment variables, console log an error message.
if (!VALID_ACCESS_TOKEN) {
  console.error("Access token is missing. Please provide a valid access token in the environment variables.");
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

module.exports = {
  checkAccessToken
};
