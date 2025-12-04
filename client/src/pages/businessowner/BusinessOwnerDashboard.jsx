import React from "react";
import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";
import KYCGuard from "../../components/KYCGuard/KYCGuard.jsx";

const BusinessOwnerDashboard = () => {
  return (
    <AppLayout role={ROLES.BUSINESS_OWNER}>
      <KYCGuard userRole={ROLES.BUSINESS_OWNER}>
        <div style={styles.container}>
          <h1>Business Owner Dashboard</h1>
          <p>Welcome to your verified dashboard!</p>
          
          {/* Add your dashboard content here */}
          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>My Services</h3>
              <p>Manage your food safety services</p>
            </div>
            
            <div style={styles.card}>
              <h3>My Agents</h3>
              <p>View and manage your agents</p>
            </div>
            
            <div style={styles.card}>
              <h3>Documents</h3>
              <p>Access your compliance documents</p>
            </div>
            
            <div style={styles.card}>
              <h3>Compliance Calendar</h3>
              <p>Track important compliance dates</p>
            </div>
          </div>
        </div>
      </KYCGuard>
    </AppLayout>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },
};

export default BusinessOwnerDashboard;