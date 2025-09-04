import React, { useEffect, useState, useRef, useCallback } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import ChartModal from "../components/ChartModal";
import {
  Box,
  Button,
  Typography,
  Card,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

function StudentDashboard() {
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState({});
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loadingExam, setLoadingExam] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentExam, setCurrentExam] = useState(null);

  const [attempts, setAttempts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chartOpen, setChartOpen] = useState(false);

  const timerRef = useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await API.get("categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch exams by category
  const fetchExams = async (categoryId) => {
    try {
      const res = await API.get(`categories/${categoryId}/exams/`);
      setExams((prev) => ({ ...prev, [categoryId]: res.data }));
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  };

  // Start exam
  const startExam = async (exam) => {
    setLoadingExam(true);
    try {
      const res = await API.get(`exams/${exam.id}/questions/`);
      setQuestions(res.data);
      setAnswers({});
      setResult(null);
      setTimer(exam.duration_minutes * 60);
      setCurrentExam(exam);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoadingExam(false);
    }
  };

  // Cancel exam
  const cancelExam = () => {
    clearTimeout(timerRef.current);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setTimer(0);
    setCurrentExam(null);
  };

  // Fetch attempts
  const fetchAttempts = async () => {
    try {
      const res = await API.get("attempts-per-category/");
      setAttempts(res.data);
    } catch (err) {
      console.error("Error fetching attempts:", err);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("leaderboard/");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // Format timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerChange = (qId, optionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  // Submit exam
  const submitExam = useCallback(async () => {
    if (!questions.length || !currentExam) return;

    try {
      // Stop timer on submit
      clearTimeout(timerRef.current);

      const res = await API.post(`exams/${currentExam.id}/submit/`, {
        answers,
      });

      let score = res.data?.score ?? 0;
      let pass =
        typeof res.data?.pass !== "undefined"
          ? res.data.pass
          : score >= Math.ceil(questions.length / 2);

      setResult({
        ...res.data,
        score,
        pass,
      });

      fetchAttempts();
      fetchLeaderboard();
    } catch (err) {
      console.error("Error submitting exam:", err);

      let correctCount = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_option) {
          correctCount++;
        }
      });
      setResult({
        score: correctCount,
        pass: correctCount >= Math.ceil(questions.length / 2),
      });
    }
  }, [questions, answers, currentExam]);

  // Timer countdown (keep running even after submission)
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  useEffect(() => {
    fetchCategories();
    fetchAttempts();
    fetchLeaderboard();
  }, []);

  // Chart modal handlers
  const handleOpenCharts = () => setChartOpen(true);
  const handleCloseCharts = () => setChartOpen(false);

  return (
    <div>
      <Navbar />
      <Box
        sx={{
          p: 3,
          maxWidth: "1400px",
          margin: "0 auto",
          minHeight: "100vh",
          background: "linear-gradient(to right, #f0f4f8, #d9e4ec)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", mb: 3 }}
        >
          Student Dashboard
        </Typography>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {/* Left Panel */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 4, bgcolor: "white" }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              {loadingCategories && <CircularProgress />}
              {categories.map((cat) => (
                <Box key={cat.id} sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => fetchExams(cat.id)}
                    sx={{ mb: 1, color: "#1976d2", borderColor: "#1976d2", "&:hover": { bgcolor: "#e3f2fd" } }}
                  >
                    {cat.name} - Load Exams
                  </Button>
                  {exams[cat.id]?.map((exam) => (
                    <Card key={exam.id} sx={{ p: 2, mb: 2, bgcolor: "#fafafa", borderRadius: 2, boxShadow: 2 }}>
                      <Typography variant="subtitle1">{exam.title}</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>{exam.description}</Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => startExam(exam)}
                        disabled={loadingExam}
                        sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}
                      >
                        {loadingExam ? "Loading..." : "Start Test"}
                      </Button>
                    </Card>
                  ))}
                </Box>
              ))}
            </Card>
          </Grid>

          {/* Middle Panel */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, bgcolor: "white", minHeight: "70vh", borderRadius: 3, boxShadow: 4 }}>
              {!currentExam && questions.length === 0 && !result && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Typography variant="h6" color="text.secondary">Select an exam from the left panel to start</Typography>
                </Box>
              )}

              {currentExam && questions.length > 0 && (
                <>
                  {/* Pass/Fail at the top */}
                  {result && (
                    <Box sx={{ mb: 2, textAlign: "center" }}>
                      <Typography variant="h5" fontWeight="bold" color={result.pass ? "green" : "red"}>
                        {result.pass ? "PASS ✅" : "FAIL ❌"}
                      </Typography>
                      <Typography variant="body1">
                        Score: {result.score} / {questions.length}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h5">{currentExam?.title}</Typography>
                    <Typography variant="h6" color="#00897b">
                      Timer: {formatTime(timer)}
                    </Typography>
                  </Box>

                  <Box sx={{ maxHeight: "50vh", overflowY: "auto", p: 2, borderRadius: 2, bgcolor: "#fafafa" }}>
                    {questions.map((q, idx) => (
                      <Box
                        key={q.id}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: answers[q.id] ? "#e8f5e9" : "white",
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          {idx + 1}. {q.text}
                        </Typography>
                        <RadioGroup
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        >
                          {q.options.map((opt) => (
                            <FormControlLabel
                              key={opt.id}
                              value={opt.id}
                              control={<Radio />}
                              label={opt.text}
                              sx={{
                                display: "block",
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                "&:hover": { bgcolor: "#f1f1f1" },
                                bgcolor: answers[q.id] === String(opt.id) ? "#bbdefb" : "transparent",
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button variant="contained" color="success" onClick={submitExam}>Submit Exam</Button>
                    <Button variant="outlined" color="error" onClick={cancelExam}>Cancel Exam</Button>
                  </Box>
                </>
              )}
            </Card>
          </Grid>

          {/* Right Panel */}
          <Grid item xs={12} md={3}>
            <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={() => setChartOpen(true)}>
              View Exam Charts
            </Button>

            <Card sx={{ mb: 3, p: 3, bgcolor: "white", borderRadius: 3, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom>Your Attempts</Typography>
              <List>
                {attempts.map((a) => (
                  <ListItem key={a.category_id}>
                    <ListItemText primary={`Category: ${a.category_name}`} secondary={`Attempts: ${a.count}`} />
                  </ListItem>
                ))}
              </List>
            </Card>

            <Card sx={{ mb: 3, p: 3, bgcolor: "white", borderRadius: 3, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom>Leaderboard</Typography>
              <List>
                {leaderboard.map((entry, idx) => (
                  <React.Fragment key={idx}>
                    <ListItem>
                      <ListItemText
                        primary={<span>{idx + 1}. {entry.student} {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : ""}</span>}
                        secondary={`Attempts: ${entry.attempts}, Score: ${entry.score}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Chart Modal */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mb: 2 }}
        onClick={handleOpenCharts}
      >
        {/* View Exam Charts */}
      </Button>

      <ChartModal open={chartOpen} onClose={handleCloseCharts} />
    </div>
  );
}

export default StudentDashboard;
