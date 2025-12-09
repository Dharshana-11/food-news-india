/**
 * @file App.jsx
 * @description Root component of the application that sets up global configuration,
 * authentication context, and routing.
 * @module App
 */

import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

/**
 * Root application component.
 *
 * Responsibilities:
 * - Provides global Ant Design theme.
 * - Wraps the app inside React Router for client-side navigation.
 * - Injects authentication context globally.
 *
 * @function App
 * @returns {JSX.Element} The root component containing providers and routes.
 *
 * @example
 * // In your main entry file (index.js)
 * import { createRoot } from "react-dom/client";
 * import App from "./App";
 *
 * const root = createRoot(document.getElementById("root"));
 * root.render(<App />);
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
        {/**
         * AuthProvider exposes authentication state and methods to all child components.
         * @see {@link module:context/AuthContext}
         */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ConfigProvider>
  );
};

export default App;
