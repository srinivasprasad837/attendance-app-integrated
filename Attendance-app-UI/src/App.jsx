import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import View from "./pages/View";
import Manage from "./pages/Manage";
import Settings from "./pages/Settings";
import { NotificationContext } from "./NotificationContext";
import Notification from "./components/Notification";
import SchoolRounded from '@mui/icons-material/SchoolRounded';

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Breadcrumbs,
} from "@mui/material";
import { styled, ThemeProvider } from "@mui/material";
import config from "./config";
import theme from "./theme";

const StyledLink = styled(Link)({
  color: "white",
  textDecoration: "none",
  transition: "all 0.1s ease",
  "&:hover": {
    fontSize: "1.1rem",
  },
});

function App() {
  const [notification, setNotification] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <StyledLink to="/">Attendance App<SchoolRounded/></StyledLink>
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Breadcrumbs
                aria-label="breadcrumb"
                separator="|"
                sx={{
                  "& .MuiBreadcrumbs-separator": {
                    color: "white",
                  },
                }}
              >
                <StyledLink to="/">Home</StyledLink>
                <StyledLink to="/view">View Attendance</StyledLink>
                <StyledLink to="/manage">Manage Students</StyledLink>
                <StyledLink to="/settings">Settings</StyledLink>
              </Breadcrumbs>
            </Box>
          </Toolbar>
        </AppBar>
        <div>
          <Container maxWidth="lg" sx={{ mt: 4, padding: { xs: 2, md: 3 } }}>
          <Notification 
            notification={notification}
            open={open}
            setOpen={setOpen}
            severity={severity}
          />
            <NotificationContext.Provider
              value={{ setNotification, setOpen, setSeverity }}
            >
              <Routes>
                <Route path="/" element={<Home baseURL={config.baseURL} />} />
                <Route path="/view" element={<View baseURL={config.baseURL} />} />
                <Route
                  path="/manage"
                  element={<Manage baseURL={config.baseURL} />}
                />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </NotificationContext.Provider>
          </Container>
        </div>
    </ThemeProvider>
  );
}

export default App;
