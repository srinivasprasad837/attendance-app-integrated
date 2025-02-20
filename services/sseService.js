// services/sseService.js

let clients = [];
let unacknowledgedNotifications = []; // Store unacknowledged notifications

const addClient = (client) => {
  clients.push(client);
  console.log(`Client connected, total clients: ${clients.length}`);
  if (unacknowledgedNotifications.length > 0) {
    unacknowledgedNotifications.forEach(notification => {
      client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });
  }
};

const removeClient = (clientId) => {
  clients = clients.filter(client => client.id !== clientId);
  console.log(`Client disconnected, total clients: ${clients.length}`);
};

const broadcastNotification = (notificationMessage) => {
  unacknowledgedNotifications.push(notificationMessage); // Add to unacknowledged notifications
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(notificationMessage)}\n\n`);
  });
};

const acknowledgeNotification = () => {
  unacknowledgedNotifications = []; // Clear all unacknowledged notifications
  console.log('Notifications acknowledged and cleared');
};

const getUnacknowledgedNotifications = () => {
  return unacknowledgedNotifications;
};

const clearUnacknowledgedNotifications = () => {
  unacknowledgedNotifications = [];
};

module.exports = {
  clients, // Export clients for debugging purposes (optional)
  addClient,
  removeClient,
  broadcastNotification,
  acknowledgeNotification,
  getUnacknowledgedNotifications,
  clearUnacknowledgedNotifications
};
