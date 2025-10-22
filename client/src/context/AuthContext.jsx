import { createContext, useContext, useState, useEffect } from "react";

import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// --- Create global Auth context ---
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider
 * -------------
 * Provides authentication state (currentUser, loading)
 * and methods (login, logout) to all components.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Handler : Verifies whether session is active & returns user details from backend using Session ID.
   * Ensures we get role, name, etc., verified from the server.
   */
  const verifyActiveSession = async () => {
    //const token = await firebaseUser.getIdToken();
    // console.log(token);

    const sessionToken = localStorage.getItem("sessionToken");

    try{
      // Verifies whether user has active session
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/session/verify-session`, {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (!res.ok) {
        localStorage.removeItem("sessionToken");
        return null;
      }

      const data = await res.json();
      if (!data.user) throw new Error("Invalid user data");

      return data.user;
    } catch (err) {
      // Log the raw response to help debugging non-JSON backend issues
      const text = await res.text();
      console.error("Backend response not JSON:", text);
      throw new Error("Backend returned invalid response");
    }
  };

  /**
   * Login handler
   * Authenticates user with Firebase and fetches role info from backend.
   * @param {string} identifier - email or phone
   * @param {string} password - user's password
   */
  const login = async (identifier, password) => {
    let userCredential;

    if (identifier.includes("@")) {
      // Email login (for super-admin or admin)
      userCredential = await signInWithEmailAndPassword(
        auth,
        identifier,
        password,
      );
    } else {
      // Phone-based login (custom implementation)
      userCredential = await signInWithPhoneAuth(auth, identifier, password);
    }

    //Extract JWT ID Token from Firebase usercredential object
    const idToken = await userCredential.user.getIdToken();

    // POST /api/session creates a new session for user
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/session`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }); 

    // Extract user data & session token from response
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create session");

    //Store session token in local storage for future API calls
    localStorage.setItem("sessionToken", data.sessionToken);

    const backendUser = await verifyActiveSession();
    setCurrentUser(backendUser);

    return backendUser;
  };

  /** Logout the user from Firebase and clear context */
  const logout = async () => {

    const sessionToken = localStorage.getItem("sessionToken");

    await fetch( `${import.meta.env.VITE_API_URL}/api/session/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionToken}`},
    });

    localStorage.removeItem("sessionToken")
    await signOut(auth);
    setCurrentUser(null);
  };

  /**
   * Track Firebase auth state changes (login/logout refresh)
   * Syncs with backend to maintain correct user role & info.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const sessionToken = localStorage.getItem("sessionToken");
          if (sessionToken) {
            const backendUser = await verifyActiveSession();
            setCurrentUser(backendUser);
          } else {
            setCurrentUser(null); // no session token yet
          }
        } else {
          setCurrentUser(null);
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
