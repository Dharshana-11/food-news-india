/**
 * AuthContext.jsx
 * ============================================================================
 * Centralized authentication context for FoodPoint.
 * Supports:
 * - Admin login (email + password)
 * - User login (phone number + OTP via Firebase)
 * - Backend session creation & verification
 * - Automatic session refresh & logout handling
 *
 * Handles:
 * - Firebase Auth state
 * - Invisible reCAPTCHA setup for OTP
 * - Axios session expiration hooks
 */

import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebase.js";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut,
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

  // Holds Firebase confirmation result for OTP verification
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ---------------------------------------------------------------------------
  // Backend Session Verification (Axios-friendly)
  // ---------------------------------------------------------------------------
  /**
   * verifyActiveSession()
   * ----------------------
   * Validates the user's active backend session using HttpOnly cookies.
   * If session expired (401), tries to refresh once.
   * @returns {Promise<Object>} verified backend user object
   * @throws {Error} if session is invalid or backend returns an error
   */
  const verifyActiveSession = async () => {
    try {
      // First attempt to verify session
      let res = await api.get(ENDPOINTS.VERIFY_SESSION);

      // Axios throws for non-2xx by default, but just in case:
      if (res.status === 401) {
        // Attempt refresh
        try {
          await api.get(ENDPOINTS.REFRESH_SESSION);
          // Retry verification
          res = await api.get(ENDPOINTS.VERIFY_SESSION);
        } catch (refreshErr) {
          throw new Error("Session expired and refresh failed");
        }
      }

      const user = res.data?.user;
      if (!user) throw new Error("Invalid backend user data");

      return user;
    } catch (err) {
      console.error("verifyActiveSession error:", err.message || err);
      throw new Error("Backend session verification failed");
    }
  };

  // ---------------------------------------------------------------------------
  // reCAPTCHA Setup
  // ---------------------------------------------------------------------------

  /**
   * Setup invisible reCAPTCHA verifier for Firebase phone login.
   * Ensures a single global instance.
   */
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => console.log("reCAPTCHA verified"),
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            window.recaptchaVerifier = null;
          },
        }
      );
    }
    return window.recaptchaVerifier;
  };

  // ---------------------------------------------------------------------------
  // Admin Login (Email + Password)
  // ---------------------------------------------------------------------------

  /**
   * Admin/Super Admin login using email + password.
   * Creates backend session using Firebase ID token.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} backend user
   */
  const loginWithEmail = async (email, password) => {
    setIsPerformingLogin(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await api.post(
        ENDPOINTS.CREATE_SESSION,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const backendUser = response.data.user;
      setCurrentUser(backendUser);
      return backendUser;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OTP Login (Phone Number)
  // ---------------------------------------------------------------------------

  /**
   * Send OTP to user phone number using Firebase.
   * @param {string} phoneNumber - Full E.164 format (+91XXXXXXXXXX)
   */
  const loginWithPhone = async (phoneNumber) => {
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      setConfirmationResult(result);
      console.log("OTP sent successfully");
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Reset reCAPTCHA on failure
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      throw error;
    }
  };

  /**
   * Verify OTP and create backend session.
   * @param {string} code - 6-digit OTP
   * @returns {Promise<Object>} backend user
   */
  const verifyOTP = async (code) => {
    setIsPerformingLogin(true);

    try {
      if (!confirmationResult) {
        throw new Error("No OTP session found. Please request OTP again.");
      }

      // Firebase verification
      const userCredential = await confirmationResult.confirm(code);
      const idToken = await userCredential.user.getIdToken();

      // Create backend session
      const response = await api.post(
        ENDPOINTS.CREATE_SESSION,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      const backendUser = response.data.user;
      setCurrentUser(backendUser);
      setConfirmationResult(null);

      return backendUser;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Generic Login Selector
  // ---------------------------------------------------------------------------

  /**
   * Auto-detect login method (email or phone).
   * @param {string} identifier - email OR +91 phone number
   * @param {string} password  - required only for email login
   */
  const login = async (identifier, password) => {
    if (identifier.includes("@")) {
      return loginWithEmail(identifier, password);
    }

    if (identifier.startsWith("+91")) {
      await loginWithPhone(identifier);
      return null; // Move to OTP screen next
    }

    throw new Error("Invalid identifier format");
  };

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  /**
   * Logout user from both backend session and Firebase auth.
   */
  const logout = async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (err) {
      console.log("Logout API error (likely session expired):", err.message);
    }

    try {
      await signOut(auth);
    } catch (err) {
      console.log("Firebase sign-out error:", err.message);
    }

    setCurrentUser(null);
    setConfirmationResult(null);

    // Clear reCAPTCHA instance
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  // ---------------------------------------------------------------------------
  // Firebase Auth State Listener
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip interference during login
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

  // ---------------------------------------------------------------------------
  // Axios Session Expiry Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    api.onSessionExpired = async () => {
      console.log("Session expired — logging out");
      if (!isRefreshingSession) await logout();
    };

    api.onRefreshStart = () => {
      setIsRefreshingSession(true);
    };

    api.onRefreshEnd = () => {
      setIsRefreshingSession(false);
    };

    return () => {
      api.onSessionExpired = null;
      api.onRefreshStart = null;
      api.onRefreshEnd = null;
    };
  }, [isRefreshingSession]);

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------

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
        isRefreshingSession,
      }}
    >
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      {children}
    </AuthContext.Provider>
  );
};
