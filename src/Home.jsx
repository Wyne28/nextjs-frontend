import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { UserContext } from "./context/UserContext";

export default function Home() {
  const { user, isLoggedIn, isInitializing, logout } =
    useContext(UserContext);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const success = await logout();

      if (!success) {
        setLogoutError("Unable to log out. Please try again.");
      }
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isInitializing) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress aria-label="Loading session" />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Frontend 1.0
          </Typography>

          <Button
            color="inherit"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: 3 }}>
        {logoutError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {logoutError}
          </Alert>
        )}

        <Typography component="h1" variant="h5">
          Welcome, {user.username || user.email}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          You are logged in.
        </Typography>
      </Box>
    </Box>
  );
}