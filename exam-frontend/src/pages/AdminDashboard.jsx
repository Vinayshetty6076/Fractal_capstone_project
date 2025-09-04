import React, { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { Box, Card, CardContent, Typography } from "@mui/material";
import AdminCharts from "../components/AdminCharts"; // import charts component

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_exams: 0,
    total_attempts: 0,
    leaderboard: [],
    attempts_per_student: [],
    pass_fail_distribution: [],
    avg_score_per_exam: [],
  });

  const fetchStats = async () => {
    try {
      const res = await API.get("admin/exam-stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Stats cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Card sx={{ p: 2, bgcolor: "#e3f2fd", flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography variant="h6">Total Exams</Typography>
              <Typography variant="h4">{stats.total_exams}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ p: 2, bgcolor: "#fce4ec", flex: 1, minWidth: 150 }}>
            <CardContent>
              <Typography variant="h6">Total Attempts</Typography>
              <Typography variant="h4">{stats.total_attempts}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Charts */}
        <AdminCharts
          attemptsPerStudent={stats.attempts_per_student}
          passFailDistribution={stats.pass_fail_distribution}
          avgScorePerExam={stats.avg_score_per_exam}
        />

        {/* Leaderboard */}
        <Card sx={{ p: 2, bgcolor: "#f3e5f5", mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leaderboard (Top 10 Students)
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#ddd" }}>
                  <th>#</th>
                  <th>Student</th>
                  <th>Total Score</th>
                  <th>Total Attempts</th>
                </tr>
              </thead>
              <tbody>
                {stats.leaderboard.map((student, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ccc" }}>
                    <td>{idx + 1}</td>
                    <td>{student.username}</td>
                    <td>{student.total_score}</td>
                    <td>{student.total_attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default AdminDashboard;
