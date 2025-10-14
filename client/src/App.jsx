import {BrowserRouter as Router} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

// Root component — wraps entire app with authentication context and router
const App = () => {
  return(
    // Provides authentication state and functions to all components
    <AuthProvider>
      {/* Handles routing across pages */}
      <Router>
        <AppRoutes/>
      </Router>
    </AuthProvider>
  );
};

export default App;
