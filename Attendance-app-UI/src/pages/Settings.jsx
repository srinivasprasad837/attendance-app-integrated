import React, { useState, useRef } from "react";
    import { TextField, Button, Box, Typography, Card, CardContent, CardActions } from "@mui/material";
    import axios from "../axios";
    import config from "../config";
    import { NotificationContext } from "../NotificationContext";
    import { useContext } from "react";

    function Settings() {
      const { setNotification, setOpen } = useContext(NotificationContext);
      const [telegramBotToken, setTelegramBotToken] = useState("");
      const [telegramChatId, setTelegramChatId] = useState("");
      const [accessToken, setAccessToken] = useState("");
      const backupFileRef = useRef(null);

      const handleSaveAccessToken = () => {
        localStorage.setItem("access-token", accessToken);
        setOpen(true);
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
          setOpen(true);
          setNotification("Error downloading backup: " + error.message);
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
            setNotification("Backup uploaded successfully!");
            window.location.reload();
          } catch (error) {
            console.error("Error uploading backup:", error);
            setOpen(true);
            setNotification("Error uploading backup: " + error.message);
          }
        }
      };

      return (
        <div style={{ padding: "16px" }}>
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
              >
                Save Token
              </Button>
            </CardActions>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Backup and Restore
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: 400,
                }}
              >
                <Button disabled nt="contained" component="label" sx={{width: '100%'}}>
                  Upload Backup
                  <input
                    type="file"
                    accept=".json"
                    hidden
                    onChange={handleUploadBackup}
                    ref={backupFileRef}
                  />
                </Button>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-start'}}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadBackup}>
                Download Backup
              </Button>
            </CardActions>
          </Card>
        </div>
      );
    }

    export default Settings;
