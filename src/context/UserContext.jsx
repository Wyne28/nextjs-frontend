import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const initialized = useRef(false);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState("");
  const [isLogInError, setIsLoginError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const me = useCallback(async () => {
    try {
      const result = await fetch(`${API_URL}/api/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!result.ok) {
        setUser(null);
        setIsLoggedIn(false);
        return false;
      }

      const userData = await result.json();

      // The backend returns the user directly, not { user: ... }.
      setUser(userData);
      setIsLoggedIn(true);

      return true;
    } catch (error) {
      console.error("Failed to retrieve user:", error);
      setUser(null);
      setIsLoggedIn(false);

      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;
    me();
  }, [me]);

  const login = async (email, password) => {
    setIsLoginError(false);
    setLoginErrorMsg("");

    try {
      const result = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        setUser(null);
        setIsLoggedIn(false);
        setIsLoginError(true);
        setLoginErrorMsg(data.message || "Login failed");

        return false;
      }

      // Login creates the cookie. /api/me retrieves its user.
      const userLoaded = await me();

      if (!userLoaded) {
        setIsLoginError(true);
        setLoginErrorMsg("Logged in, but could not retrieve the user");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      setIsLoggedIn(false);
      setIsLoginError(true);
      setLoginErrorMsg("Unable to connect to the backend");

      return false;
    }
  };

  const logout = async () => {
    try {
      const result = await fetch(`${API_URL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (!result.ok) {
        return false;
      }

      setUser(null);
      setIsLoggedIn(false);

      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        me,
        isLoggedIn,
        isLogInError,
        loginErrorMsg,
        isInitializing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}