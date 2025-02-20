import axios from 'axios';

const acknowledgeNotification = async () => {
  try {
    await axios.post('/api/v1/sse/acknowledge');
    console.log('Notification acknowledged to backend from service');
  } catch (error) {
    console.error('Error acknowledging notification from service:', error);
    throw error;
  }
};

export default {
  acknowledgeNotification,
};
