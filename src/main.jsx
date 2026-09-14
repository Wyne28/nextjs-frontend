import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";
import { UserProvider } from "./context/UserProvider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CssBaseline />
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
);