import React, { useState, useEffect, useContext } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { NotificationContext } from '../NotificationContext';
import notificationService from '../services/notificationService'; // Import notification service

function StreakNotification() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, notificationCount, addNotification, clearNotifications } = useContext(NotificationContext);
  const [unreadCount, setUnreadCount] = useState(notificationCount);
  const open = Boolean(anchorEl);
  useEffect(() => {
    setUnreadCount(notificationCount);
  }, [notificationCount]);

  useEffect(() => {
    const eventSource = new EventSource('/api/v1/sse');

    eventSource.onmessage = async (event) => { // Changed to async
      try {
        const notificationData = JSON.parse(event.data);
        // Check if it's a streak notification (has studentName)
        if (notificationData.studentName) {
          addNotification(notificationData);
        }
      } catch (error) {
        console.error("Error parsing SSE event data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => { // Changed to async
    setAnchorEl(null);
    clearNotifications();
    setUnreadCount(0);
    try {
      await notificationService.acknowledgeNotification(); // Use notification service
      console.log('Notification acknowledged to backend');
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  };

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {notifications && notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        ) : (
          notifications && notifications.map((notification, index) => (
            <MenuItem key={index}>
              <Typography variant="body2">
                {notification.studentName} - {notification.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
}

export default StreakNotification;
