const express = require('express');
const router = express.Router();
const sseService = require('../services/sseService');
const studentService = require('../services/studentService');
const utilityService = require('../utilities/utilityService');

// Middleware
// const checkAccessToken = utilityService.checkAccessToken;

// API base path
const apiBasePath = "/api/v1/sse";

// SSE endpoint
router.get(
    `${apiBasePath}`,
    async (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const clientId = Date.now();
        const newClient = {
            id: clientId,
            res,
        };
        sseService.addClient(newClient);

        console.log(`${clientId} Connection open`);

        req.on('close', () => {
            console.log(`${clientId} Connection closed`);
            sseService.removeClient(clientId);
        });
    }
);

// Acknowledgement endpoint
router.post(`${apiBasePath}/acknowledge`, async (req, res) => {
    sseService.acknowledgeNotification();
    res.status(200).send({ message: 'Notification acknowledged' });
});


module.exports = router;
