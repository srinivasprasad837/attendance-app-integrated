import axios from "axios";
    const accessToken = localStorage.getItem("access-token");

    axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers["access-token"] = accessToken;
          console.log("Added access token to headers:", config.headers);
        }
        return config;
      },
      (error) => {
        console.error("Request Interceptor Error:", error.message);
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          
        }
        return Promise.reject(error);
      }
    );

    export default axios;
