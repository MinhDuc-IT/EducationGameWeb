// src/pages/SheepIntro.jsx
import { useNavigate } from "react-router-dom";
import SoundToggleButton from "../components/SoundToggleButton";
import { motion, AnimatePresence, color } from "framer-motion";
import PlayButton from "../components/PlayButton";
import { useEffect, useState } from "react";
import api from "../services/api";
import GameStats from "../components/GameStats";
import GameSummary from "../components/GameSummary";
import { FaHome } from "react-icons/fa";

function SheepColorIntro({ onLogout }) {
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

  const [latestStats, setLatestStats] = useState(null);
  let gameType = "SheepColorCounting";

  useEffect(() => {
    const fetchLatestStats = async () => {
      try {
        const res = await api.get("/GameSession/latest-session", {
          params: { gameType },
        });
        if (!res.data) {
          console.warn("No latest session found");
          setLatestStats(null);
          return;
        }
        setLatestStats(res.data);
      } catch (error) {
        console.error("Failed to load latest session:", error);
      }
    };

    fetchLatestStats();
  }, []);

  const [summaryStats, setSummaryStats] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/GameSession/summary", {
          params: { gameType },
        });
        setSummaryStats(res.data);
      } catch (error) {
        console.error("Failed to fetch summary stats:", error);
      }
    };

    fetchSummary();
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out...");

      //const userId = localStorage.getItem("userId");
      //console.log("User ID:", userId);

      await api.post("/Auth/logout");

      // Xóa localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      //localStorage.removeItem("userId");

      onLogout?.(); // sẽ setIsLoggedIn(false)
      navigate("/"); // quay lại login

      console.log("Logout successful");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* <img
        src="/images/sheep-left.png"
        alt="Sheep Left"
        style={styles.sheepLeft}
        /> */}

      <motion.img
        src="/images/sheep-left.png"
        alt="Sheep Left"
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 1.5 }}
        style={styles.sheepLeft}
      />

      {/* Câu hỏi (hiệu ứng từ trái vào) */}
      <motion.div
        key="intro-question"
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.0 }}
        style={styles.question}
      >
        Are you ready to count some sheep?
      </motion.div>

      {/* Hướng dẫn (hiệu ứng từ dưới lên) */}
      <motion.div
        key="intro-instruction"
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.5 }}
        style={styles.instruction}
      >
        Click the button below to start your adventure!
      </motion.div>

      <div style={styles.field}>
        <GameSummary summary={summaryStats} />

        <h1 style={styles.title}>
          Welcome to Sheep <span style={styles.Color}>Color</span> Counting
          Game!
        </h1>
        <AnimatePresence>
          <motion.div
            key="play-button"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayButton onClick={() => navigate("/sheep-color")} />
          </motion.div>
        </AnimatePresence>
        <SoundToggleButton />
      </div>
      {/* <button style={styles.button} onClick={logout}>
        Logout
      </button> */}

      <button onClick={() => navigate("/")} style={styles.homeButton}>
        <FaHome size={24} />
      </button>

      <GameStats
        elapsedSeconds={latestStats?.seconds ?? 0}
        round={latestStats?.maxRounds ?? 0}
        maxRounds={latestStats?.maxRounds ?? 0}
        correctFirstTryCount={latestStats?.correctFirstTry ?? 0}
        correctSecondTryCount={latestStats?.correctSecondTry ?? 0}
        isStaticTime={true}
      />
    </div>
  );
}

export default SheepColorIntro;

const styles = {
  container: {
    fontFamily: "Comic Sans MS, sans-serif",
    minHeight: "100vh",
    padding: "20px",
    textAlign: "center",
    position: "relative",
    height: "100vh",
    backgroundImage: "url(/images/grass.png)",
    backgroundPosition: "center",
  },
  homeButton: {
    position: "absolute",
    top: "7%",
    left: "7%",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    transition: "transform 0.2s",
  },

  Color: {
    fontSize: "3.5rem",
    //background: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
    background:
      "linear-gradient(90deg, #FF4D4D, #FF9900, #FFFF33, #33FF33, #33CCFF, #9966FF, #FF66CC)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textAlign: "center",
    marginBottom: "1rem",
  },
  sheepLeft: {
    position: "absolute",
    left: "0%",
    top: "25%",
    width: "20vw",
    height: "auto",
    zIndex: 1,
    filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
    transition: "transform 0.3s ease",
  },
  field: {
    position: "relative",
    width: "60vw",
    margin: "0 auto",
    height: "80vh",
    backgroundImage: `url(/images/sheepIntro.png), url(/images/grass.png)`,
    backgroundSize: "40vw, cover", // sheepIntro giữ nguyên kích thước, grass trải rộng
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundPosition: "center bottom, center",
    borderRadius: "12px",
    overflow: "hidden",
    border: "5px solid rgb(69, 201, 75)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "2rem",
    marginTop: "-42vh",
    color: "#fff",
    textShadow: "2px 2px 4px #000",
  },
  button: {
    position: "absolute",
    top: "10%",
    left: "3%",
    transform: "translate(50%, -50%)",
    padding: "12px 24px",
    fontSize: "1.2rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#00FF00",
  },
  question: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#2e7d32",
  },
  instruction: {
    fontSize: "1rem",
    color: "#444",
    marginTop: "20px",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease-in-out",
    fontFamily: "Comic Sans MS, sans-serif",
  },
  logoutButtonHover: {
    backgroundColor: "#d32f2f",
    transform: "scale(1.05)",
  },
};
