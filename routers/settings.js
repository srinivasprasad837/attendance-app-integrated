const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');

// GET dropdown options
router.get('/api/v1/settings/dropdown-options', async (req, res) => {
  try {
    const options = await settingsService.getDropdownOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dropdown options' });
  }
});



// POST add dropdown option BY VALUE { "option": "value"}
router.post('/api/v1/settings/dropdown-options', async (req, res) => {
  try {
    const { option } = req.body;
    await settingsService.addDropdownOption(option);
    res.status(201).json({ message: 'Dropdown option added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add dropdown option' });
  }
});

// DELETE dropdown option BY VALUE { "option": "value"}
router.post('/api/v1/settings/dropdown-options/delete', async (req, res) => {
  try {
    const { option } = req.body;
    await settingsService.deleteDropdownOption(option);
    res.json({ message: 'Dropdown option deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dropdown option' });
  }
});

module.exports = router;
