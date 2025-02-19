import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Box, Typography, Card, CardContent, CardActions, List, ListItem, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { NotificationContext } from "../NotificationContext";
import useErrorHandler from "../hooks/useErrorHandler";
import settingsService from "../services/settingsService";
import "./Settings.css";

function Settings() {
  const { showNotification } = useContext(NotificationContext);
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [newOption, setNewOption] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    setIsLoading(true)
    try {
      const response = await settingsService.getDropdownOptions()
      setDropdownOptions(response);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }
  
  const handleDownloadBackup = async () => {
    try {
      const response = await settingsService.downloadBackup();

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error);
    }
  }

  const handleAddOption = async () => {
    if (newOption.trim() !== "") {
      try {
        await settingsService.addDropdownOption(newOption.trim());
        const updatedOptions = await settingsService.getDropdownOptions();
        setDropdownOptions(updatedOptions);
        setNewOption("");
        showNotification("Dropdown option added successfully", "success");
      } catch (error) {
        console.error("Error adding dropdown option:", error);
        handleError(error);
       }
    }
  }
  

  const handleDeleteOption = async (optionToDelete) => {
    try {
      await settingsService.deleteDropdownOption(optionToDelete);
      const updatedOptions = await settingsService.getDropdownOptions();
      setDropdownOptions(updatedOptions);
      showNotification("Dropdown option deleted successfully", "success");
    } catch (error) {
      handleError(error);
    }
  }

  const handleSaveAccessToken = () => {
    localStorage.setItem("access-token", accessToken);
    showNotification("Access token saved!", "success");
    window.location.reload();
  };


  return (
    <div className="settings-container">
      <h1>Settings</h1>
      {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress />
                </Box>
              )}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Save Access Token
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 400,
            }}
          >
            <TextField
              label="Token"
              variant="outlined"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAccessToken}
            startIcon={<SaveIcon />}
          >
            Save Token
          </Button>
        </CardActions>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Backup
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 400,
            }}
          >
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-start'}}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadBackup}
            startIcon={<DownloadIcon />}
          >
            Download Backup
          </Button>
        </CardActions>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manage Dropdown class
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 400,
            }}
          >
            <TextField
              label="New Option"
              variant="outlined"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddOption}
              startIcon={<AddIcon />}
            >
              Add Option
            </Button>
            <List>
              {dropdownOptions.map((option, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteOption(option)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {option}
                </ListItem>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
