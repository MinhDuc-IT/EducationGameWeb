// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const games = [
  {
    title: "Sheep Counting",
    description: "Count all the sheep correctly!",
    image: "/images/sheep.png",
    path: "/sheep-intro",
  },
  {
    title: "Colored Sheep Counting",
    description: "Count only the colored sheep!",
    image: "/images/sheep-red.png",
    path: "/sheep-color-intro",
  },
];

function Home({onLogout}) {
  const navigate = useNavigate();

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
      <h1 style={styles.title}>🐑 Welcome to Sheep Games! 🐑</h1>
      <div style={styles.gameList}>
        {games.map((game, index) => (
          <div
            key={index}
            style={styles.card}
            onClick={() => navigate(game.path)}
          >
            <img src={game.image} alt={game.title} style={styles.image} />
            <h2 style={styles.gameTitle}>{game.title}</h2>
            <p style={styles.description}>{game.description}</p>
          </div>
        ))}
      </div>
      <button style={styles.button} onClick={logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    background: "linear-gradient(to bottom, #dcedc8, #f0f4c3)",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  title: {
    fontSize: "2.8rem",
    color: "#4caf50",
    marginBottom: "30px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
  gameList: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    width: "260px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  image: {
    width: "120px",
    height: "auto",
    marginBottom: "15px",
  },
  gameTitle: {
    fontSize: "1.5rem",
    color: "#388e3c",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
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
};

export default Home;
