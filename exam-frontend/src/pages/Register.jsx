import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setMessage("");
    try {
      await API.post("register/", { username, password, role });
      setMessage("✅ Registered successfully! Please login.");
      setUsername("");
      setPassword("");
      setRole("student");
    } catch {
      setMessage("❌ Error registering user");
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
              Register
            </Typography>

            {message && (
              <Typography color={message.startsWith("✅") ? "success.main" : "error"} variant="body2" align="center" sx={{ mb: 1 }}>
                {message}
              </Typography>
            )}

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

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: "#ccc" }}>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                sx={{ color: "#fff" }}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.2 }}
              onClick={handleRegister}
            >
              Register
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2, color: "#fff" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#90caf9", textDecoration: "underline" }}>
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Register;
