// component hiển thị điểm tổng hợp của game
import React from "react";

function GameSummary({ summary }) {
  const actualSummary = summary || { // nếu có dữ liệu phiên chơi thì gán, nếu chưa chơi lần nào thì mặc định là 0
    totalSeconds: 0,
    totalScore: 0,
    accuracy: 0,
  };

  const formatSeconds = (seconds) => { // hàm format thời gian
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return ( // giao diện chính
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.header}>⏱ Total Time</th>
            <th style={styles.header}>📊 Total Score</th>
            <th style={styles.header}>🎯 Accuracy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.cell}>{formatSeconds(actualSummary.totalSeconds)}</td>
            <td style={styles.cell}>{actualSummary.totalScore}</td>
            <td style={styles.cell}>{(actualSummary.accuracy * 100).toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    bottom: "-20vh",
    backgroundColor: "#f0f8ff",
    borderRadius: "40px",
    padding: "16px",
    maxWidth: "90vw",
    margin: "0 auto",
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#2c3e50",
    backdropFilter: "blur(8px)", // blur background
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 0 12px rgba(255, 255, 255, 0.5), 0 0 24px rgba(100, 200, 255, 0.3)", // blurred border glow
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  header: {
    padding: "12px",
    backgroundColor: "#dcedc8",
    fontWeight: "bold",
    borderRadius: "40px",
  },
  cell: {
    padding: "10px",
    backgroundColor: "#ffffff",
  },
};

export default GameSummary;
