// src/pages/LoginPage.jsx
import { useState } from "react";
import api from "../services/api"; 
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState(""); // Tên đăng nhập
  const [password, setPassword] = useState(""); // Mật khẩu
  const [error, setError] = useState(""); // Lỗi đăng nhập
  const navigate = useNavigate(); // Dùng để điều hướng sau khi đăng nhập thành công

  const speak = (text, rate = 1, pitch = 1) => { // Hàm để phát âm thanh
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

  const handleSubmit = async (e) => { // Hàm xử lý khi người dùng gửi form đăng nhập
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setError(""); // Đặt lại lỗi trước khi gửi yêu cầu
    console.log("Submitting:", { username, password });

    try { // Gửi yêu cầu đăng nhập đến API
      const res = await api.post("/Auth/login", {
        username,
        password,
      });

      console.log("Login response:", res.data);

      localStorage.setItem("accessToken", res.data.accessToken); // Lưu accessToken vào localStorage
      localStorage.setItem("refreshToken", res.data.refreshToken); // Lưu refreshToken vào localStorage

      //speak("Sheep Counting Game", 1, 1.5);
      onLogin?.(); // Gọi hàm onLogin nếu có, để thông báo đăng nhập thành công
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err.message);
    }
  };

  return ( // Giao diện đăng nhập
    <div style={styles.container}>
      <h2 style={styles.heading}>Welcome to Sheep Counting Game 🐑</h2>
      {/* form đăng nhập */}
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
        {/* nút đăng nhập */}
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
