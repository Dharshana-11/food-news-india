import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPerformingLogin, setIsPerformingLogin] = useState(false);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);

  const verifyActiveSession = async () => {
    const res = await api.get(ENDPOINTS.VERIFY_SESSION);
    if (!res.data?.user) throw new Error("Invalid user data");
    return res.data.user;
  };

const login = async (identifier, password) => {
  setIsPerformingLogin(true);
  try {
    let userCredential;
    if (identifier.includes("@")) {
      userCredential = await signInWithEmailAndPassword(auth, identifier, password);
    } else {
      userCredential = await signInWithPhoneAuth(auth, identifier, password);
    }

    const idToken = await userCredential.user.getIdToken();

    // Create backend session
    const response = await api.post(ENDPOINTS.CREATE_SESSION, {}, {
      headers: { Authorization: `Bearer ${idToken}` },
    });

    // 🔥 FIX: Get user from CREATE_SESSION response, don't call verify again
    const backendUser = response.data.user;
    setCurrentUser(backendUser);
    return backendUser;
  } finally {
    setIsPerformingLogin(false);
  }
};

  const logout = async () => {
    try { 
      await api.post(ENDPOINTS.LOGOUT); 
    } catch (err) {
      console.log("Logout API error (expected if session expired):", err.message);
    }
    
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Firebase signout error:", err.message);
    }
    
    setCurrentUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Don't interfere with login flow
      if (isPerformingLogin) return;

      if (!firebaseUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const backendUser = await verifyActiveSession();
        setCurrentUser(backendUser);
      } catch (err) {
        console.log("Session verification failed:", err.message);
        // Don't call logout here - let onSessionExpired handle it
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isPerformingLogin]);

  // Handle global session expired from Axios
  useEffect(() => {
    api.onSessionExpired = async () => {
      console.log("Session expired - logging out");
      if (!isRefreshingSession) {
        await logout();
      }
    };
    
    api.onRefreshStart = () => {
      console.log("Session refresh started");
      setIsRefreshingSession(true);
    };
    
    api.onRefreshEnd = () => {
      console.log("Session refresh ended");
      setIsRefreshingSession(false);
    };

    return () => {
      // Cleanup
      api.onSessionExpired = null;
      api.onRefreshStart = null;
      api.onRefreshEnd = null;
    };
  }, [isRefreshingSession]);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, isRefreshingSession }}>
      {children}
    </AuthContext.Provider>
  );
};