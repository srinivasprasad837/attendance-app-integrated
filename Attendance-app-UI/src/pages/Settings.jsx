import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { TextField, Button, Box, Typography, Card, CardContent, CardActions, List, ListItem, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { NotificationContext } from "../NotificationContext";
import settingsService from "../services/settingsService";
import "./Settings.css";

function Settings() {
  const { showNotification } = useContext(NotificationContext);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [backupFileRef] = useState(useRef(null));
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
      console.error("Error fetching dropdown options:", error);
      showNotification("Failed to load dropdown options", "error");
    } finally {
      setIsLoading(false)
    }
  };

  const handleSaveAccessToken = () => {
    localStorage.setItem("access-token", accessToken);
    showNotification("Access token saved!", "success");
    window.location.reload();
  };

  const handleSaveTelegramConfig = () => {
    const config = {
      botToken: telegramBotToken,
      chatId: telegramChatId,
    };
    localStorage.setItem("telegramConfig", JSON.stringify(config));
    showNotification("Telegram configuration saved!", "success");
    window.location.reload();
  };

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
      console.error("Error downloading backup:", error);
      let errorMessage = "Error downloading backup: ";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else {
          errorMessage += error.message;
        }
      showNotification(errorMessage, "error");
    }
  };

  const handleUploadBackup = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("backup", file);

      try {
        await settingsService.uploadBackup(formData);
        showNotification("Backup uploaded successfully!", "success");
        window.location.reload();
      } catch (error) {
        console.error("Error uploading backup:", error);
        let errorMessage = "Error uploading backup: ";
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else {
          errorMessage += error.message;
        }
        showNotification(errorMessage, "error");
      }
    }
  };

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
        setNotification("Failed to add dropdown option");
        showNotification("Failed to add dropdown option", "error");
       }
    }
  };

  const handleDeleteOption = async (optionToDelete) => {
    try {
      await settingsService.deleteDropdownOption(optionToDelete);
      const updatedOptions = await settingsService.getDropdownOptions();
      setDropdownOptions(updatedOptions);
      showNotification("Dropdown option deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting dropdown option:", error);
      showNotification("Failed to delete dropdown option", "error");
    }
  }


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
            {/* <Button disabled nt="contained" component="label" sx={{width: '100%'}}>
              Upload Backup
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleUploadBackup}
                ref={backupFileRef}
              />
            </Button> */}
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
