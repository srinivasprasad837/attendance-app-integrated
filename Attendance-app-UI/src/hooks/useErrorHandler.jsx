import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';

const useErrorHandler = () => {
  const { showNotification } = useContext(NotificationContext);

  const handleError = (error) => {
    console.error("Error:", error);
    let errorMessage = "Error";
    if (error.response && error.response.data) {
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
    } else {
      errorMessage += ` ${error.message}`;
    }
    showNotification(errorMessage, "error");
  };

  return { handleError };
};

export default useErrorHandler;
