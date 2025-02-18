const Setting = require('../models/setting');

const getDropdownOptions = async () => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return []; // Return empty array if no settings document exists yet
    }
    return setting.dropdownOptions;
  } catch (error) {
    console.error("Error fetching dropdown options:", error);
    throw error;
  }
};



const addDropdownOption = async (option) => {
  try {
    let setting = await Setting.findOne();

    if (!setting) {
      // If no settings document exists, create a new one
      setting = new Setting({ dropdownOptions: [option] });
    } else {
      // Otherwise, add the new option to the existing array
      setting.dropdownOptions.push(option);
    }

    await setting.save();
  } catch (error) {
    console.error("Error adding dropdown option:", error);
    throw error;
  }
};

const deleteDropdownOption = async (option) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      throw new Error('Settings not found');
    }
    
    setting.dropdownOptions = setting.dropdownOptions.filter(value => value !== option)
    await setting.save();
  } catch (error) {
    console.error("Error deleting dropdown option:", error);
    throw error;
  }
};


module.exports = {
  getDropdownOptions,
  addDropdownOption,
  deleteDropdownOption
};
