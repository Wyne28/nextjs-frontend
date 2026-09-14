import { useCallback, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

async function fetchCurrentUser(signal) {
  const response = await fetch(`${API_URL}/api/me`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve the user");
  }

  return response.json();
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLogInError, setIsLoginError] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");

  const isLoggedIn = user !== null;

  useEffect(() => {
    const controller = new AbortController();

    async function initialize() {
      try {
        const currentUser = await fetchCurrentUser(controller.signal);

        if (!controller.signal.aborted) {
          setUser(currentUser);
        }
      } catch {
        if (!controller.signal.aborted) {
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
      }
    }

    initialize();

    return () => controller.abort();
  }, []);

  const me = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const login = async (email, password) => {
    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setUser(null);
        setIsLoginError(true);
        setLoginErrorMsg(data?.message || "Login failed");
        return false;
      }

      const userLoaded = await me();

      if (!userLoaded) {
        setIsLoginError(true);
        setLoginErrorMsg(
          "Login succeeded, but your session could not be loaded.",
        );
        return false;
      }

      return true;
    } catch {
      setUser(null);
      setIsLoginError(true);
      setLoginErrorMsg("Unable to connect to the backend.");
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        return false;
      }

      setUser(null);
      setIsLoginError(false);
      setLoginErrorMsg("");
      return true;
    } catch {
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        isInitializing,
        isLogInError,
        loginErrorMsg,
        login,
        logout,
        me,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}