import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPerformingLogin, setIsPerformingLogin] = useState(false);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  /**
   * Verify active session with backend
   */
  const verifyActiveSession = async () => {
    const res = await api.get(ENDPOINTS.VERIFY_SESSION);
    if (!res.data?.user) throw new Error("Invalid user data");
    return res.data.user;
  };

  /**
   * Setup invisible reCAPTCHA for phone authentication
   * Only creates one instance globally
   */
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log("reCAPTCHA verified");
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            window.recaptchaVerifier = null;
          }
        }
      );
    }
    return window.recaptchaVerifier;
  };

  /**
   * Admin/Super Admin login with email + password
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Authenticated user
   */
  const loginWithEmail = async (email, password) => {
    setIsPerformingLogin(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Create backend session
      const response = await api.post(ENDPOINTS.CREATE_SESSION, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const backendUser = response.data.user;
      setCurrentUser(backendUser);
      return backendUser;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  /**
   * User login with phone number (sends OTP)
   * @param {string} phoneNumber - E.164 format (+91XXXXXXXXXX)
   * @returns {Promise<void>}
   */
  const loginWithPhone = async (phoneNumber) => {
    try {
      const appVerifier = setupRecaptcha();
      const confirmResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmationResult(confirmResult);
      console.log("OTP sent successfully");
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      throw error;
    }
  };

  /**
   * Verify OTP code and create backend session
   * @param {string} code - 6-digit OTP
   * @returns {Promise<Object>} Authenticated user
   */
  const verifyOTP = async (code) => {
    setIsPerformingLogin(true);
    try {
      if (!confirmationResult) {
        throw new Error("No OTP session found. Please request OTP again.");
      }

      // Verify OTP with Firebase
      const userCredential = await confirmationResult.confirm(code);
      const idToken = await userCredential.user.getIdToken();

      // Create backend session
      const response = await api.post(ENDPOINTS.CREATE_SESSION, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const backendUser = response.data.user;
      setCurrentUser(backendUser);
      setConfirmationResult(null); // Clear confirmation result
      
      return backendUser;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  /**
   * Generic login function - detects email vs phone
   * @param {string} identifier - Email or phone number
   * @param {string} password - Password (only for email)
   * @returns {Promise<Object>} Authenticated user
   */
  const login = async (identifier, password) => {
    if (identifier.includes("@")) {
      return await loginWithEmail(identifier, password);
    } else if (identifier.startsWith("+91")) {
      // For phone, this just sends OTP
      // Actual login happens in verifyOTP
      await loginWithPhone(identifier);
      return null; // User must verify OTP next
    } else {
      throw new Error("Invalid identifier format");
    }
  };

  /**
   * Logout user from both Firebase and backend
   */
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
    setConfirmationResult(null);
    
    // Clear reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  // Monitor Firebase auth state changes
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
      api.onSessionExpired = null;
      api.onRefreshStart = null;
      api.onRefreshEnd = null;
    };
  }, [isRefreshingSession]);

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login,
        loginWithEmail,
        loginWithPhone,
        verifyOTP,
        logout, 
        isRefreshingSession
      }}
    >
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      {children}
    </AuthContext.Provider>
  );
};