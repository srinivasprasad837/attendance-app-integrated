const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');
const utilityService = require('../utilities/utilityService');

// Middleware
const checkAccessToken = utilityService.checkAccessToken;

// API base path
const apiBasePath = "/api/v1/settings";

// GET dropdown options
router.get(
  `${apiBasePath}/dropdown-options`,
    [checkAccessToken],
    async (req, res) => {
      try {
        const options = await settingsService.getDropdownOptions();
        res.json(options);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dropdown options' });
      }
    });



// POST add dropdown option BY VALUE { "option": "value"}
router.post(
  `${apiBasePath}/dropdown-options`,
  [checkAccessToken], 
    async (req, res) => {
    try {
      const { option } = req.body;
      await settingsService.addDropdownOption(option);
      res.status(201).json({ message: 'Dropdown option added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add dropdown option' });
    }
  });

// DELETE dropdown option BY VALUE { "option": "value"}
router.post(
  `${apiBasePath}/dropdown-options/delete`, 
    [checkAccessToken],
    async (req, res) => {
    try {
      const { option } = req.body;
      await settingsService.deleteDropdownOption(option);
      res.json({ message: 'Dropdown option deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete dropdown option' });
    }
  });

module.exports = router;
