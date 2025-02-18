import axios from "../axios";
import config from "../config";

const getDropdownOptions = async () => {
  try {
    const response = await axios.get(`${config.baseURL}/settings/dropdown-options`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateDropdownOptions = async (options) => {
  try {
    const response = await axios.post(`${config.baseURL}/settings/dropdown-options`, { options });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addDropdownOption = async (option) => {
  try {
    const response = await axios.post(`${config.baseURL}/settings/dropdown-options`, { option: option });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteDropdownOption = async (optionToDelete) => {
  try {
    const response = await axios.post(`${config.baseURL}/settings/dropdown-options/delete`, { option: optionToDelete });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export default {
  getDropdownOptions,
  updateDropdownOptions,
  addDropdownOption,
  deleteDropdownOption,
};
