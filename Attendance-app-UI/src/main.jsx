import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();

function Root() {
  return (
    <ThemeProvider theme={theme}>
      {/* <BrowserRouter basename="/AttendanceApp-UI"> */}
      <HashRouter>
        <App />
      </HashRouter>
      {/* </BrowserRouter> */}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <Root />
  // </React.StrictMode>
);
