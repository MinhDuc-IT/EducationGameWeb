import React, { useEffect, useState } from "react";

function GameStats({
  startTime,
  elapsedSeconds,
  round,
  maxRounds,
  correctFirstTryCount,
  correctSecondTryCount,
  isStaticTime = false,
}) {
  const [elapsedTime, setElapsedTime] = useState("0s");
  const [bonus, setBonus] = useState(null);
  const [lastScore, setLastScore] = useState(0);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  useEffect(() => {
    if (isStaticTime) {
      setElapsedTime(formatTime(elapsedSeconds));
    } else {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const seconds = Math.floor((now - start) / 1000);
        setElapsedTime(formatTime(seconds));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, elapsedSeconds, isStaticTime]);

  const score = correctFirstTryCount * 2 + correctSecondTryCount * 1;

  // Effect phát hiện điểm tăng
  useEffect(() => {
    const diff = score - lastScore;
    setBonus(`+${diff}`);
    console.log("Score diff:", diff);
    setTimeout(() => setBonus(null), 1200);
    setLastScore(score);
  }, [score]);

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {isStaticTime ? "Last Played" : "Current Session"}
      </div>
      <div style={styles.item}>⏱ Time: {elapsedTime}</div>
      <div style={styles.item}>
        🔄 Round:{" "}
        {isStaticTime ? `${maxRounds}/${maxRounds}` : `${round}/${maxRounds}`}
      </div>
      <div style={styles.item}>
        ⭐ Score: {score}
        {bonus && <span style={styles.bonus}>{bonus}</span>}
      </div>
      <img
        src="/images/sheep-stats.png"
        alt="Stats Icon"
        style={styles.sheep}
      />
      <img
        src="/images/grass-land.png"
        alt="Stats Icon"
        style={styles.grassLand}
      />

      {/* Animation keyframe inject */}
      <style>{`
        @keyframes popFade {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1.4) translateY(-5px);
          }
          60% {
            transform: scale(1.1) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(1) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    top: "14vh",
    right: 10,
    backgroundImage:
      "linear-gradient(to top, rgb(129, 248, 59), rgb(255,255,255), rgb(161, 217, 250))",
    padding: "15px 20px",
    borderRadius: "12px",
    boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
    fontSize: "20px",
    lineHeight: "1.6",
    textAlign: "left",
    height: "auto",
    width: "14vw",
  },
  item: {
    marginBottom: "15px",
    fontWeight: "bold",
    position: "relative",
  },
  bonus: {
    marginLeft: "10px",
    color: "rgba(232, 232, 0, 0.8)",
    fontWeight: "bold",
    fontSize: "2rem",
    position: "absolute",
    right: "2vw",
    animation: "popFade 1.6s ease-out",
    textShadow: "2px 2px #fff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#2e7d32",
    textShadow: "1px 1px #fff",
  },
  sheep: {
    position: "relative",
    width: "15vw",
    height: "auto",
    filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
  },
  grassLand: {
    position: "relative",
    bottom: "10px",
    width: "14vw",
    height: "auto",
    objectFit: "cover",
    filter: "brightness(0.8)",
  },
};

export default GameStats;
