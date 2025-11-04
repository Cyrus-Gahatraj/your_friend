import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/Auth.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/ReactToastify.css";

console.log("main.jsx is loading...");
console.log("API Base URL: http://localhost:8000");

createRoot(document.getElementById("root")).render(
  <StrictMode>

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="bottom-center"
            autoClose={3000}
            theme="light"
            transition={Slide}
          />
        </AuthProvider>
      </BrowserRouter>

  </StrictMode>,
);
