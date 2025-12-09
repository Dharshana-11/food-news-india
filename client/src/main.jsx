/**
 * @file main.jsx
 * @description Application entry point - Renders the root React component into the DOM
 * @module main
 * 
 * @description
 * This is the main entry point of the React application. It sets up the root React component
 * and renders it into the DOM element with id 'root'. The application is wrapped in StrictMode
 * for highlighting potential problems during development.
 * 
 * @requires react
 * @requires react-dom/client
 * @requires ./index.css
 * @requires ./App
 * 
 * @example
 * // This file is automatically loaded by the build system (Vite)
 * // No manual invocation is needed
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Create a root for the React application and render the App component
// The root element is defined in index.html with id="root"
createRoot(document.getElementById("root")).render(
  // StrictMode helps identify potential problems in the application
  <StrictMode>
    {/* Root application component */}
    <App />
  </StrictMode>,
);
