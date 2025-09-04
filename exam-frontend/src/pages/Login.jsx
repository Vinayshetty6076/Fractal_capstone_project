import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import examBg from "../assets/exam_background.jpeg"; 

import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
} from "@mui/material";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("login/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      const role = res.data.user.role?.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "student") navigate("/student");
      else navigate("/");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${examBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 8, bgcolor: "rgba(0,0,0,0.75)" }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom sx={{ color: "#fff" }}>
              Login
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{ style: { color: "#fff" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <TextField
              fullWidth
              margin="normal"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{ style: { color: "#fff" } }}
              InputLabelProps={{ style: { color: "#ccc" } }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.2 }}
              onClick={handleLogin}
            >
              Login
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2, color: "#fff" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#90caf9", textDecoration: "underline" }}>
                Register
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;
