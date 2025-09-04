import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import API from "../api/api"; // Axios instance with JWT token

function AdminDashboard() {
  const [avgScorePerExam, setAvgScorePerExam] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [attemptsPerCategory, setAttemptsPerCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch all dashboard data
        const [statsRes, attemptsRes, leaderboardRes] = await Promise.all([
          API.get("/admin/exam-stats/"), // avg score per exam & leaderboard
          API.get("/attempts-per-category/"),
          API.get("/leaderboard/"),
        ]);

        setAvgScorePerExam(statsRes.data.avg_score_per_exam || []);
        setLeaderboard(leaderboardRes.data || []);
        setAttemptsPerCategory(attemptsRes.data || []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <Typography>Loading dashboard...</Typography>;

  // 1️⃣ Average Score per Exam (Line)
  const avgScoreOptions = {
    chart: { type: "line" },
    title: { text: "Average Score per Exam" },
    xAxis: { categories: avgScorePerExam.map((e) => e.exam__title), title: { text: "Exams" } },
    yAxis: { min: 0, max: 100, title: { text: "Average Score" } },
    series: [{ name: "Average Score", data: avgScorePerExam.map((e) => e.avg_score), color: "#00897b" }],
  };

  // 2️⃣ Top Students Leaderboard (Column)
  const leaderboardOptions = {
    chart: { type: "column" },
    title: { text: "Top Students Leaderboard" },
    xAxis: { categories: leaderboard.map((u) => u.username), title: { text: "Students" } },
    yAxis: { min: 0, title: { text: "Total Score" } },
    series: [{ name: "Total Score", data: leaderboard.map((u) => u.total_score), color: "#1976d2" }],
  };

  // 3️⃣ Pass / Fail Distribution (Pie) - dynamically calculated
  let totalPass = 0;
  let totalFail = 0;

  leaderboard.forEach((student) => {
    // Use actual pass/fail if backend provides it
    if ("pass" in student) {
      student.pass ? totalPass++ : totalFail++;
    } else {
      // fallback: pass if score >= 50% of total_questions
      const totalQ = student.total_questions || 1;
      student.total_score >= Math.ceil(totalQ / 2) ? totalPass++ : totalFail++;
    }
  });

  const passFailOptions = {
    chart: { type: "pie" },
    title: { text: "Pass / Fail Distribution" },
    series: [
      {
        name: "Students",
        colorByPoint: true,
        data: [
          { name: "Pass", y: totalPass, color: "#4caf50" },
          { name: "Fail", y: totalFail, color: "#f44336" },
        ],
      },
    ],
  };

  // 4️⃣ Attempts per Category (Bar)
  const attemptsOptions = {
    chart: { type: "bar" },
    title: { text: "Student Attempts per Category" },
    xAxis: { categories: attemptsPerCategory.map((c) => c.category_name), title: { text: "Category" } },
    yAxis: { min: 0, title: { text: "Number of Attempts" } },
    series: [{ name: "Attempts", data: attemptsPerCategory.map((c) => c.count), color: "#ffb74d" }],
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, bgcolor: "#e1f5fe" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Average Score per Exam</Typography>
            <HighchartsReact highcharts={Highcharts} options={avgScoreOptions} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, bgcolor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Students Leaderboard</Typography>
            <HighchartsReact highcharts={Highcharts} options={leaderboardOptions} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, bgcolor: "#e8f5e9" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pass / Fail Distribution</Typography>
            <HighchartsReact highcharts={Highcharts} options={passFailOptions} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, bgcolor: "#f3e5f5" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Attempts per Category</Typography>
            <HighchartsReact highcharts={Highcharts} options={attemptsOptions} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default AdminDashboard;
