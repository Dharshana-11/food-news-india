import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminLogin from "./pages/AdminLogin";
// import Unauthorized from "./pages/Unauthorized";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get Firebase ID token
          const token = await user.getIdToken();

          // Fetch user info from backend protected route
          const res = await fetch("http://localhost:5000/super-admin/dashboard", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Not authorized");

          const data = await res.json();

          // Save user info (including role) from backend
          setCurrentUser({
            uid: user.uid,
            name: data.message.replace("Welcome ", "").replace(", Super Admin!", ""),
            role: "super-admin",
          });
        } catch (err) {
          //console.error(err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null); // User logged out
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>; // optional loading screen

  return (
    <Router>
      <Routes>

         {/* Redirect root path to login */}
  <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Super Admin Route */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute user={currentUser} requiredRole="super-admin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
