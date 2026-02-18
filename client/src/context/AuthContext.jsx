/**
 * AuthContext.jsx - Enhanced
 * ============================================================================
 * Centralized authentication with integrated signup flow
 * New features:
 * - Detects new users after OTP verification
 * - Handles profile completion (role + name)
 * - Seamless login + signup experience
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
  const [confirmationResult, setConfirmationResult] = useState(null);

  // New user state
  const [pendingNewUser, setPendingNewUser] = useState(null);

  // ---------------------------------------------------------------------------
  // Backend Session Verification
  // ---------------------------------------------------------------------------
  const verifyActiveSession = async () => {
    try {
      let res = await api.get(ENDPOINTS.VERIFY_SESSION);

      if (res.status === 401) {
        try {
          await api.get(ENDPOINTS.REFRESH_SESSION);
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
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
    return window.recaptchaVerifier;
  };

  // ---------------------------------------------------------------------------
  // Admin Login (Email + Password)
  // ---------------------------------------------------------------------------
  const loginWithEmail = async (email, password) => {
    setIsPerformingLogin(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await api.post(
        ENDPOINTS.CREATE_SESSION,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } },
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
  const loginWithPhone = async (phoneNumber) => {
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier,
      );

      setConfirmationResult(result);
      console.log("OTP sent successfully");
    } catch (error) {
      console.error("Error sending OTP:", error);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // Verify OTP - Enhanced with new user detection
  // ---------------------------------------------------------------------------
  const verifyOTP = async (code) => {
    setIsPerformingLogin(true);

    try {
      if (!confirmationResult) {
        throw new Error("No OTP session found. Please request OTP again.");
      }

      // Step 1: Firebase verification
      const userCredential = await confirmationResult.confirm(code);
      const idToken = await userCredential.user.getIdToken();

      // Step 2: Check if user exists in backend
      const verifyResponse = await api.get(ENDPOINTS.VERIFY_USER, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const { exists, user, uid, phone } = verifyResponse.data;

      // Existing user - create session and login
      if (exists) {
        const sessionResponse = await api.post(
          ENDPOINTS.CREATE_SESSION,
          {},
          { headers: { Authorization: `Bearer ${idToken}` } },
        );

        const backendUser = sessionResponse.data.user;
        setCurrentUser(backendUser);
        setConfirmationResult(null);
        setPendingNewUser(null);

        return { isNewUser: false, user: backendUser };
      }

      // New user - set pending state for profile completion
      setPendingNewUser({ uid, phone, idToken });
      setConfirmationResult(null);

      return { isNewUser: true, uid, phone };
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Complete Profile - For new users
  // ---------------------------------------------------------------------------
  const completeProfile = async (name, role) => {
    if (!pendingNewUser) {
      throw new Error("No pending user profile to complete");
    }

    setIsPerformingLogin(true);

    try {
      const { idToken } = pendingNewUser;

      // Step 1: Create user profile
      const profileResponse = await api.post(
        ENDPOINTS.COMPLETE_PROFILE,
        { name, role },
        { headers: { Authorization: `Bearer ${idToken}` } },
      );

      const newUser = profileResponse.data.user;

      // Step 2: Create session
      const sessionResponse = await api.post(
        ENDPOINTS.CREATE_SESSION,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } },
      );

      const backendUser = sessionResponse.data.user;
      setCurrentUser(backendUser);
      setPendingNewUser(null);

      return backendUser;
    } catch (error) {
      console.error("Profile completion error:", error);
      throw error;
    } finally {
      setIsPerformingLogin(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Generic Login Selector
  // ---------------------------------------------------------------------------
  const login = async (identifier, password) => {
    if (identifier.includes("@")) {
      return loginWithEmail(identifier, password);
    }

    if (identifier.startsWith("+91")) {
      await loginWithPhone(identifier);
      return null;
    }

    throw new Error("Invalid identifier format");
  };

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const logout = async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (err) {
      console.log("Logout API error:", err.message);
    }

    try {
      await signOut(auth);
    } catch (err) {
      console.log("Firebase sign-out error:", err.message);
    }

    setCurrentUser(null);
    setConfirmationResult(null);
    setPendingNewUser(null);

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
        pendingNewUser,

        login,
        loginWithEmail,
        loginWithPhone,
        verifyOTP,
        completeProfile,

        logout,
        isRefreshingSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
