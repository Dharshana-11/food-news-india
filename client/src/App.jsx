import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ConfigProvider } from "antd";
import AppRoutes from "./AppRoutes";

// Root component — wraps entire app with authentication context and router
const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Ant Design global theme override using your CSS variables
          colorPrimary: "#ff6c1f",
          colorInfo: "#ff6c1f",
        },
      }}
    >
      {/* Provides authentication state and functions to all components */}
      <AuthProvider>
        {/* Handles routing across pages */}
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
