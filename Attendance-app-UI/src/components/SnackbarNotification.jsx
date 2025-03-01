import { useEffect, useContext } from "react";
import { Alert } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { NotificationContext } from "../NotificationContext";

function SnackbarNotification() {

  const { open, setOpen, severity, notification } = useContext(NotificationContext);
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  return open ? (
    <Alert
      variant="filled"
      severity={severity}
      sx={{
        top: 100,
        left: 75,
        right: 75,
        position: 'fixed',
        zIndex: 9999,
      }}
      action={
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon sx={{ color: "#ffffff" }} fontSize="small" />
        </IconButton>
      }
    >
      {notification}
    </Alert>
  ) : null;
}

export default SnackbarNotification;
