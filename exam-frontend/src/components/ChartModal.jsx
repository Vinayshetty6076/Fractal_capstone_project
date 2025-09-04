import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import API from "../api/api";

function ChartModal({ open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [attemptsPerCategory, setAttemptsPerCategory] = useState([]);
  const [avgScorePerExam, setAvgScorePerExam] = useState([]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all required data
        const [statsRes, attemptsRes, leaderboardRes] = await Promise.all([
          API.get("/admin/exam-stats/"), // average scores per exam
          API.get("/attempts-per-category/"),
          API.get("/leaderboard/"),
        ]);

        setAvgScorePerExam(statsRes.data.avg_score_per_exam);
        setLeaderboard(leaderboardRes.data);
        setAttemptsPerCategory(attemptsRes.data);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  // Average Score per Exam
  const avgScoreOptions = {
    chart: { type: "line" },
    title: { text: "Average Score per Exam" },
    xAxis: { categories: avgScorePerExam.map((e) => e.exam__title), title: { text: "Exams" } },
    yAxis: { min: 0, max: 100, title: { text: "Average Score" } },
    series: [{ name: "Average Score", data: avgScorePerExam.map((e) => e.avg_score), color: "#00897b" }],
  };

  // Top Students Leaderboard
  const leaderboardOptions = {
    chart: { type: "column" },
    title: { text: "Top Students Leaderboard" },
    xAxis: { categories: leaderboard.map((u) => u.username), title: { text: "Students" } },
    yAxis: { min: 0, title: { text: "Total Score" } },
    series: [{ name: "Total Score", data: leaderboard.map((u) => u.total_score), color: "#1976d2" }],
  };

  // Dynamic Pass/Fail calculation
  const passFailData = attemptsPerCategory.map((cat) => {
    const studentsInCat = leaderboard.filter((l) => l.category_id === cat.category_id);
    let pass = 0, fail = 0;
    studentsInCat.forEach((s) => {
      const totalQuestions = s.total_questions ?? 1; // fallback
      if (s.score >= Math.ceil(totalQuestions / 2)) pass++;
      else fail++;
    });
    return { name: cat.category_name, pass, fail };
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Exam Charts
        <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          <HighchartsReact highcharts={Highcharts} options={avgScoreOptions} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <HighchartsReact highcharts={Highcharts} options={leaderboardOptions} />
        </Box>

        {passFailData.map((cat, idx) => {
          const pieOptions = {
            chart: { type: "pie" },
            title: { text: `${cat.name} Pass/Fail Ratio` },
            series: [
              {
                name: "Students",
                colorByPoint: true,
                data: [
                  { name: "Pass", y: cat.pass, color: "#4caf50" },
                  { name: "Fail", y: cat.fail, color: "#f44336" },
                ],
              },
            ],
          };
          return (
            <Box key={idx} sx={{ mb: 4 }}>
              <HighchartsReact highcharts={Highcharts} options={pieOptions} />
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}

export default ChartModal;
