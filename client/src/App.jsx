import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

/**
 * Root application component.
 *
 * Responsibilities:
 * - Provides global Ant Design theme
 * - Wraps the app inside React Router
 * - Injects authentication context globally
 *
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff6c1f",
          colorInfo: "#ff6c1f",
        },
      }}
    >
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;
