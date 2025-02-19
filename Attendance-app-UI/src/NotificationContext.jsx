import React, { createContext, useState } from "react";

export const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [notification, setNotification] = useState("");

  const showNotification = (message, severityType = "success") => {
    setNotification(message);
    setSeverity(severityType);
    setOpen(true);
  };

  return (
    <NotificationContext.Provider value={{ open, setOpen, severity, notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
