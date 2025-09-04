import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        bgcolor: "#f5f5f5",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Online Exam Portal
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {user && (
          <Typography variant="subtitle1">
            Hello, {` ${user.username}`}
          </Typography>
        )}
        <Button variant="contained" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Navbar;
