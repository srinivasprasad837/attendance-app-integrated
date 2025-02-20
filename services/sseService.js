// services/sseService.js

let clients = [];

const addClient = (client) => {
  clients.push(client);
  console.log(`Client connected, total clients: ${clients.length}`);
};

const removeClient = (clientId) => {
  clients = clients.filter(client => client.id !== clientId);
  console.log(`Client disconnected, total clients: ${clients.length}`);
};

const broadcastNotification = (notificationMessage) => {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(notificationMessage)}\n\n`);
  });
};

module.exports = {
  clients, // Export clients for debugging purposes (optional)
  addClient,
  removeClient,
  broadcastNotification,
};
