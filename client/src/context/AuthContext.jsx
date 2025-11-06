/**
 * AuthContext.jsx
 * ----------------
 * Provides global authentication state and utilities using Firebase and backend session verification.
 *
 * Responsibilities:
 * - Tracks authentication state (login/logout).
 * - Syncs Firebase auth with backend HttpOnly cookie sessions.
 * - Exposes `login`, `logout`, and `currentUser` to the app.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// --- Create global Auth context ---
const AuthContext = createContext();

/**
 * Custom hook to consume authentication context.
 * @returns {{ currentUser: Object|null, loading: boolean, login: Function, logout: Function }}
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider
 * -------------
 * Wraps the app to provide authentication state and methods to all components.
 *
 * @param {Object} props
 * @param {JSX.Element} props.children - React children components.
 * @returns {JSX.Element} Provider component with auth state and methods.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * verifyActiveSession()
   * ----------------------
   * Validates the user's active session with the backend using HttpOnly cookies.
   * If expired, attempts session refresh before retrying verification.
   * @returns {Promise<Object>} Verified backend user object.
   * @throws {Error} If session is invalid or backend returns an error.
   */
  const verifyActiveSession = async () => {
    try {
      // Attempt to verify existing session
      let res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/session/verify-session`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      // If session expired, try refreshing
      if (res.status === 401) {
        const refreshRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/session/refresh-session`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!refreshRes.ok) throw new Error("Failed to refresh session");

        // Retry verification after refresh
        res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/session/verify-session`,
          {
            method: "GET",
            credentials: "include",
          },
        );
      }

      const data = await res.json();
      if (!res.ok || !data.user) throw new Error("Invalid user data");

      return data.user;
    } catch (err) {
      console.error("Session verification error:", err);
      throw new Error("Backend returned invalid response");
    }
  };

  /**
   * login()
   * --------
   * Authenticates the user via Firebase (email or phone) and
   * creates a corresponding backend session using the Firebase ID token.
   *
   * @param {string} identifier - User’s email or phone number.
   * @param {string} password - Password credential.
   * @returns {Promise<Object>} Verified backend user object.
   * @throws {Error} If login or backend session creation fails.
   */
  const login = async (identifier, password) => {
    let userCredential;

    if (identifier.includes("@")) {
      // Email-based login (for super-admin/admin)
      userCredential = await signInWithEmailAndPassword(
        auth,
        identifier,
        password,
      );
    } else {
      // Phone-based login (custom implementation)
      userCredential = await signInWithPhoneAuth(auth, identifier, password);
    }

    // Extract JWT ID Token from Firebase user credential
    const idToken = await userCredential.user.getIdToken();

    // Create a backend session
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create session");

    const backendUser = await verifyActiveSession();
    setCurrentUser(backendUser);
    return backendUser;
  };

  /**
   * logout()
   * ---------
   * Ends the backend session and signs the user out from Firebase.
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/session/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      await signOut(auth);
      setCurrentUser(null);
    }
  };

  /**
   * useEffect → onAuthStateChanged
   * -------------------------------
   * Subscribes to Firebase auth state changes.
   * When a user logs in/out or refreshes, verifies the backend session
   * to ensure roles and permissions stay synced.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setCurrentUser(null);
        } else {
          const backendUser = await verifyActiveSession();
          setCurrentUser(backendUser);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
