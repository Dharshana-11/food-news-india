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
   * Handler : Fetch user details from backend using Firebase ID token.
   * Ensures we get role, name, etc., verified from the server.
   */
  const fetchUserFromBackend = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();
    console.log(token);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    try {
      const data = await res.json();
      if (!data.user) throw new Error("Invalid user data");

      return {
        uid: data.user.uid,
        name: data.user.name,
        role: data.user.role,
      };
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

    const backendUser = await fetchUserFromBackend(userCredential.user);
    setCurrentUser(backendUser);

    return backendUser;
  };

  /** Logout the user from Firebase and clear context */
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  /**
   * Track Firebase auth state changes (login/logout refresh)
   * Syncs with backend to maintain correct user role & info.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const backendUser = await fetchUserFromBackend(firebaseUser);
          setCurrentUser(backendUser);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
