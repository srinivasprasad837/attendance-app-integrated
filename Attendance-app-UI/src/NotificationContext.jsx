import React, { createContext, useState } from "react";

export const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [notification, setNotification] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const showNotification = (message, severityType = "success") => {
    setNotification(message);
    setSeverity(severityType);
    setOpen(true);
  };

  const addNotification = (newNotification) => {
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    setNotificationCount(prevCount => prevCount + 1);
    console.log(JSON.stringify(newNotification))
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
  };


  return (
    <NotificationContext.Provider value={{ 
      open, 
      setOpen, 
      severity, 
      notification, 
      showNotification,
      notifications,
      notificationCount,
      addNotification,
      clearNotifications
     }}>
      {children}
    </NotificationContext.Provider>
  );
};
