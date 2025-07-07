// src/pages/GameMap.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SoundToggleButton from "../components/SoundToggleButton";

const levelPoints = [
  { id: 1, name: "Sheep Counting", x: 10, y: 60, unlocked: true },
  { id: 2, name: "Color Counting", x: 50, y: 70, unlocked: true },
  { id: 3, name: "New Game", x: 80, y: 65, unlocked: true },
];

const GameMap = ({ onLogout }) => {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [characterPos, setCharacterPos] = useState({
    x: levelPoints[0].x,
    y: levelPoints[0].y,
  });
  const [pathQueue, setPathQueue] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log("Logging out...");
      await api.post("/Auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      onLogout?.();
      navigate("/");
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const moveCharacter = async (path) => {
    setIsMoving(true);
    for (let i = 0; i < path.length; i++) {
      const nextPoint = levelPoints.find((p) => p.id === path[i]);
      await new Promise((res) => {
        setCharacterPos({ x: nextPoint.x, y: nextPoint.y });
        setTimeout(res, 2000);
      });
      setCurrentLevelId(nextPoint.id);
    }
    setIsMoving(false);
    const finalPoint = levelPoints.find((p) => p.id === path[path.length - 1]);
    setSelectedGame(finalPoint);
    setShowInstruction(true);
  };

  const handlePointClick = (point) => {
    if (!point.unlocked || point.id === currentLevelId || isMoving) return;
    const step = point.id > currentLevelId ? 1 : -1;
    const path = [];
    for (
      let i = currentLevelId + step;
      step > 0 ? i <= point.id : i >= point.id;
      i += step
    ) {
      path.push(i);
    }
    setPathQueue(path);
  };

  useEffect(() => {
    const startPoint = levelPoints.find((p) => p.id === currentLevelId);
    setSelectedGame(startPoint);

    setTimeout(() => {
      setShowInstruction(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (pathQueue.length > 0 && !isMoving) {
      moveCharacter(pathQueue);
      setPathQueue([]);
    }
  }, [pathQueue, isMoving]);

  const handlePlay = () => {
    if (selectedGame?.name === "Sheep Counting") {
      navigate("/sheep-intro");
    } else if (selectedGame?.name === "Color Counting") {
      navigate("/sheep-color-intro");
    } else if (selectedGame?.name === "New Game") {
      navigate("/new-game");
    }
  };

  return (
    <div style={styles.container}>
      <SoundToggleButton />

      <button onClick={logout} style={styles.logoutButton}>
        <span style={{ color: "green" }}>Logout</span>
      </button>

      <motion.img
        src="/images/sheep-left.png"
        alt="Character"
        style={styles.character}
        animate={{
          left: `${characterPos.x}%`,
          top: `${characterPos.y}%`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {levelPoints.map((point) => (
        <div
          key={point.id}
          onClick={() => handlePointClick(point)}
          style={styles.levelPoint(point)}
        >
          {point.id}
        </div>
      ))}

      <AnimatePresence mode="wait">
        {showInstruction && selectedGame && (
          <motion.div
            key={selectedGame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.instructionModal(selectedGame)}
          >
            <h2 style={{ marginBottom: "12px" }}>Instructions</h2>
            <p style={{ marginBottom: "20px" }}>
              Get ready to play <strong>{selectedGame.name}</strong>!
            </p>
            <button onClick={handlePlay} style={styles.playButton}>
              Play
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameMap;

const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    backgroundImage: 'url("/images/grass.png")',
    backgroundSize: "cover",
    overflow: "hidden",
  },
  homeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 20,
    fontSize: "2rem",
    background: "white",
    borderRadius: "50%",
    padding: "10px",
    border: "2px solid green",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  logoutButton: {
    position: "absolute",
    top: "10%",
    left: "1%",
    transform: "translate(50%, -50%)",
    fontSize: "1.2rem",
    backgroundColor: "white",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s",

    borderRadius: "50%",
    padding: "10px",
    border: "2px solid green",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  character: {
    position: "absolute",
    width: "8vw",
    height: "auto",
    zIndex: 10,
  },
  levelPoint: (point) => ({
    position: "absolute",
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: "translate(-50%, -50%)",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: point.unlocked ? "#4caf50" : "#bbb",
    border: "3px solid white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "0.9rem",
    cursor: point.unlocked ? "pointer" : "not-allowed",
    zIndex: 5,
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  }),
  instructionModal: (selectedGame) => ({
    position: "absolute",
    left: `${selectedGame.x}%`,
    top: `${selectedGame.y - 10}%`,
    transform: "translate(-50%, -100%)",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 30,
    textAlign: "center",
    width: "200px",
  }),
  playButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
