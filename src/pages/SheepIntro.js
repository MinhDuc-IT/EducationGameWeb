// src/pages/SheepIntro.jsx
import { useNavigate } from "react-router-dom";
import SoundToggleButton from "../components/SoundToggleButton";
import { motion, AnimatePresence } from "framer-motion";
import PlayButton from "../components/PlayButton";
import { useEffect, useState } from "react";

function SheepIntro() {
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

  useEffect(() => {
    // setTimeout(() => {
    //     speak(`Sheep Counting Game`, 1, 1.5);
    //   }, 1000);
  }, []);

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
    },
    title: {
      fontSize: "2rem",
      marginTop: "-42vh",
      color: "#fff",
      textShadow: "2px 2px 4px #000",
    },
    button: {
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
      backgroundColor: "#45a049",
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
  };

  return (
    <div style={styles.container}>
      {/* Câu hỏi (hiệu ứng từ trái vào) */}
      <motion.div
        key="intro-question"
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.5 }}
        style={styles.question}
      >
        Are you ready to count some sheep?
      </motion.div>

      {/* Hướng dẫn (hiệu ứng từ dưới lên) */}
      <motion.div
        key="intro-instruction"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 1 }}
        style={styles.instruction}
      >
        Click the button below to start your adventure!
      </motion.div>

      <div style={styles.field}>
        <h1 style={styles.title}>Welcome to Sheep Counting Game!</h1>
        <AnimatePresence>
          <motion.div
            key="play-button"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlayButton onClick={() => navigate("/sheep")} />
          </motion.div>
        </AnimatePresence>
        <SoundToggleButton />
      </div>
    </div>
  );
}

export default SheepIntro;
