import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./context/UserContext";

export default function LoginPage() {
  const username = useRef(null);
  const password = useRef(null);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    login,
    isLoggedIn,
    isInitializing,
    isLogInError,
    loginErrorMsg,
  } = useContext(UserContext);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const onLogin = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await login(
        username.current.value.trim(),
        password.current.value,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing || isLoggedIn) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Login
          </Typography>

          <Box component="form" onSubmit={onLogin}>
            <Box sx={{ mb: 2 }}>
              <TextField
                id="username"
                name="username"
                label="Username or email"
                type="text"
                autoComplete="username"
                inputRef={username}
                disabled={isSubmitting}
                required
                fullWidth
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                inputRef={password}
                disabled={isSubmitting}
                required
                fullWidth
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Box>

            {isLogInError && (
              <Typography
                color="error"
                role="alert"
                sx={{ mt: 2 }}
              >
                {loginErrorMsg}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}