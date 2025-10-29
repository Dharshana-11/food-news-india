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

    try{
      // Verifies whether user has active session
      let res = await fetch(`${import.meta.env.VITE_API_URL}/api/session/verify-session`, {
        method: "GET",
        credentials: "include",
      });

      if(res.status === 401){
        const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/api/session/refresh-session`, {
        method: "POST",
        credentials: "include",
      });

      if(!refreshRes.ok){
        throw new Error("Failed to refresh session");
      }

      res = await fetch(`${import.meta.env.VITE_API_URL}/api/session/verify-session`, {
        method: "GET",
        credentials: "include",
      });
    }
      const data = await res.json();
      if (!data.user || !res.ok) throw new Error("Invalid user data");

      return data.user;
    
    } catch (err) {
      console.log("Session verification error", err);
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
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      credentials: "include"
    }); 

    // Extract user data from response
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create session");

    const backendUser = await verifyActiveSession();
    setCurrentUser(backendUser);

    return backendUser;
  };

  /** Logout the user from Firebase and clear context */
  const logout = async () => {

    await fetch( `${import.meta.env.VITE_API_URL}/api/session/logout`, {
      method: "POST",
      credentials: "include",
    });

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
