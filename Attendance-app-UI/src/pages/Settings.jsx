import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { TextField, Button, Box, Typography, Card, CardContent, CardActions, List, ListItem, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { NotificationContext } from "../NotificationContext";
import settingsService from "../services/settingsService";
import "./Settings.css";

function Settings() {
  const { setNotification, setOpen, setSeverity } = useContext(NotificationContext);
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
    try {
      const response = await settingsService.getDropdownOptions()
      setDropdownOptions(response);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      setNotification("Failed to load dropdown options");
      setOpen(true);
      setSeverity("error");
    }
  };

  const handleSaveAccessToken = () => {
    localStorage.setItem("access-token", accessToken);
    setOpen(true);
    setSeverity("success");
    setNotification("Access token saved!");
    window.location.reload();
  };

  const handleSaveTelegramConfig = () => {
    const config = {
      botToken: telegramBotToken,
      chatId: telegramChatId,
    };
    localStorage.setItem("telegramConfig", JSON.stringify(config));
    setOpen(true);
    setSeverity("success");
    setNotification("Telegram configuration saved!");
    window.location.reload();
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await axios.get(
        `${config.baseURL}/student/attendance/backup`,
        {
          responseType: "blob",
        }
      );

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
      setOpen(true);
      setSeverity("error");
      setNotification(errorMessage);
    }
  };

  const handleUploadBackup = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("backup", file);

      try {
        await axios.post(
          `${config.baseURL}/student/attendance/backup`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setOpen(true);
        setSeverity("success");
        setNotification("Backup uploaded successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error uploading backup:", error);
        let errorMessage = "Error uploading backup: ";
        if (error.response && error.response.data) {
          errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else {
          errorMessage += error.message;
        }
        setOpen(true);
        setSeverity("error");
        setNotification(errorMessage);
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
        setNotification("Dropdown option added successfully");
        setOpen(true);
        setSeverity("success");
      } catch (error) {
        console.error("Error adding dropdown option:", error);
        setNotification("Failed to add dropdown option");
        setOpen(true);
        setSeverity("error");
       }
    }
  };

  const handleDeleteOption = async (optionToDelete) => {
    try {
      await settingsService.deleteDropdownOption(optionToDelete);
      const updatedOptions = await settingsService.getDropdownOptions();
      setDropdownOptions(updatedOptions);
      setNotification("Dropdown option deleted successfully");
      setOpen(true);
      setSeverity("success");
    } catch (error) {
      console.error("Error deleting dropdown option:", error);
      setNotification("Failed to delete dropdown option");
      setOpen(true);
      setSeverity("error");
    }
  }


  return (
    <div className="settings-container">
      <h1>Settings</h1>

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
