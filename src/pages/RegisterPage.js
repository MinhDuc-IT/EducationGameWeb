import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const [username, setUsername] = useState(""); // Tên đăng ký
  const [password, setPassword] = useState(""); // Mật khẩu
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu
  const [error, setError] = useState(""); // Lỗi đăng ký
  const [success, setSuccess] = useState(""); // Thông báo thành công
  const navigate = useNavigate(); // Điều hướng

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await api.post("/Auth/register", {
        username,
        password,
      });

      console.log("Register response:", res.data);
      setSuccess("Registration successful! Redirecting to login...");
      //speak("Registration successful!");

      setTimeout(() => {
        navigate("/"); // Chuyển đến trang đăng nhập
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try a different username.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create a New Account 🐑</h2>
      <form onSubmit={handleRegister} style={styles.form}>
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
        <input
          type="password"
          placeholder="Confirm your password..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Register
        </button>
        {error && <p style={styles.errorText}>{error}</p>}
        {success && <p style={styles.successText}>{success}</p>}
        <p style={{ fontSize: "14px" }}>
          Have an account?{" "}
          <span
            onClick={() => navigate("/")}
            style={{
              color: "#1e88e5",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;

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
