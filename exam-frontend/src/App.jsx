import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Helper to normalize role
  const getRole = () => user?.role?.toLowerCase();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            getRole() === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/student" />
            )
          ) : (
            <Login setUser={setUser} />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            getRole() === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/student" />
            )
          ) : (
            <Register />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={getRole() === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/student"
        element={getRole() === "student" ? <StudentDashboard /> : <Navigate to="/" />}
      />

      {/* Catch-all: redirect to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
