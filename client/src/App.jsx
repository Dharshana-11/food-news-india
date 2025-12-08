/**
 * @file App.jsx
 * @description Root component of the application that sets up the React Router and Authentication context
 * @module App
 */

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

/**
 * Root component that wraps the entire application with necessary providers
 * @function App
 * @returns {JSX.Element} The root component with AuthProvider and Router
 * @example
 * // In your main entry file
 * import { createRoot } from 'react-dom/client';
 * import App from './App';
 * 
 * const container = document.getElementById('root');
 * const root = createRoot(container);
 * root.render(<App />);
 */
const App = () => {
  return (
    /**
     * AuthProvider makes authentication state and methods available to all child components
     * @see {@link module:context/AuthContext}
     */
    <AuthProvider>
      {/* 
       * React Router handles client-side routing, enabling navigation between components
       * without full page reloads
       */}
      <Router>
        {/* 
         * AppRoutes contains all the route definitions for the application
         * @see {@link module:AppRoutes}
         */}
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
