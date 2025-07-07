// src/pages/LoginPage.jsx
import { useState } from "react";
import api from "../services/api"; // Giả sử đã setup axios ở đây
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // nếu có password
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const speak = (text, rate = 1, pitch = 1) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = rate;
    utter.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google UK English Male") ||
        (v.name.includes("Microsoft David") && v.lang === "en-US")
    );
    if (preferredVoice) utter.voice = preferredVoice;
    window.speechSynthesis.speak(utter);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Submitting:", { username, password });

    try {
      const res = await api.post("/Auth/login", {
        username,
        password,
      });

      console.log("Login response:", res.data);

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      // Bạn có thể lưu userId nếu muốn:
      //localStorage.setItem("userId", res.data.userId);

      //speak("Sheep Counting Game", 1, 1.5);
      onLogin?.();
      //navigate("/sheep-intro");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Welcome to Sheep Counting Game 🐑</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
        {error && <p style={styles.errorText}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;

const styles = {
  container: {
    fontFamily: "Comic Sans MS, sans-serif",
    minHeight: "100vh",
    padding: "10px",
    textAlign: "center",
    position: "relative",
    height: "100vh",
    backgroundImage: "url(/images/grass.png)",
    backgroundPosition: "center",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "30px",
    color: "#2e7d32",
    textShadow: "1px 1px #fff",
  },
  form: {
    backgroundColor: "#ffffffcc",
    padding: "30px 40px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    width: "90%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    border: "2px solid #a5d6a7",
    borderRadius: "8px",
    outline: "none",
  },
  button: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
  },
};
