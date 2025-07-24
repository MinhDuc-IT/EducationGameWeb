// src/pages/GameMap.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import SoundToggleButton from "../components/SoundToggleButton";

const initialLevelPoints = [
  // Danh sách các điểm trên bản đồ
  { 
    id: 1, 
    name: "SheepCounting", 
    x: 10, 
    y: 60, 
    unlocked: true, 
    totalScore: 0 
  },
  {
    id: 2,
    name: "SheepColorCounting",
    x: 30,
    y: 70,
    unlocked: true,
    totalScore: 0,
  },
  {
    id: 3,
    name: "SheepMemoryMatch",
    x: 50,
    y: 65,
    unlocked: true,
    totalScore: 0,
  },
  {
    id: 4,
    name: "SheepPatternRecognition",
    x: 70,
    y: 62,
    unlocked: true,
    totalScore: 0,
  },
  {
    id: 5,
    name: "FinalPoint",
    x: 90,
    y: 58,
    unlocked: false,
    totalScore: 0,
    isFinal: true,
  },
];

const GameMap = ({ onLogout }) => {
  const [levelPoints, setLevelPoints] = useState(initialLevelPoints); // Danh sách các điểm trên bản đồ
  const [currentLevelId, setCurrentLevelId] = useState(1); // ID của cấp độ hiện tại
  const [characterPos, setCharacterPos] = useState({
    // Vị trí của nhân vật
    x: initialLevelPoints[0].x,
    y: initialLevelPoints[0].y,
  });
  const [pathQueue, setPathQueue] = useState([]); // Hàng đợi các điểm cần di chuyển
  const [isMoving, setIsMoving] = useState(false); // Trạng thái di chuyển của nhân vật
  const [showInstruction, setShowInstruction] = useState(false); // Hiển thị hướng dẫn
  const [selectedGame, setSelectedGame] = useState(initialLevelPoints[0]); // Trò chơi đã chọn
  const [hoveredLockedPoint, setHoveredLockedPoint] = useState(null); // Điểm bị khóa đang được hover
  const [showCongrats, setShowCongrats] = useState(false); // State để hiển thị chúc mừng

  const navigate = useNavigate(); // Dùng để điều hướng đến các trang khác

  useEffect(() => {
    // Lấy trạng thái mở khóa các cấp độ từ API khi component được mount
    const fetchLevelPoints = async () => {
      // Hàm lấy trạng thái mở khóa các cấp độ
      try {
        const res = await api.get("/GameSession/unlocked-status");
        const actualData = res.data;

        const updated = initialLevelPoints.map((point) => {
          // Cập nhật trạng thái mở khóa và điểm số cho từng cấp độ
          const match = actualData.find((item) => item.gameType === point.name); // Tìm kiếm trong dữ liệu thực tế
          return {
            // Trả về đối tượng điểm đã cập nhật
            ...point,
            unlocked: match?.unlocked ?? false, // Nếu không tìm thấy, mặc định là false
            totalScore: match?.totalScore ?? 0, // Nếu không tìm thấy, mặc định là 0
          };
        });

        setLevelPoints(updated); // Cập nhật danh sách điểm trên bản đồ
        setCharacterPos({ x: updated[0].x, y: updated[0].y }); // Đặt vị trí nhân vật tại điểm đầu tiên
        setSelectedGame(updated[0]); // Đặt trò chơi đã chọn là điểm đầu tiên

        setTimeout(() => {
          setShowInstruction(true); // Hiển thị hướng dẫn sau 2 giây
        }, 2000);
      } catch (error) {
        console.error("Failed to load level points:", error);
      }
    };

    fetchLevelPoints();
  }, []);

  const logout = async () => {
    // Hàm đăng xuất người dùng
    try {
      console.log("Logging out...");
      await api.post("/Auth/logout");
      localStorage.removeItem("accessToken"); // Xóa accessToken khỏi localStorage
      localStorage.removeItem("refreshToken"); // Xóa refreshToken khỏi localStorage
      onLogout?.(); // Gọi hàm onLogout nếu có
      navigate("/"); // Điều hướng về trang đăng nhập
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const playSound = (src, volume = 1, maxDuration = null) => {
    // Hàm phát âm thanh
    const audio = new Audio(src);
    audio.volume = volume;
    audio
      .play()
      .then(() => {
        // Nếu có giới hạn thời gian, dừng lại sau maxDuration (ms)
        if (maxDuration !== null) {
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; // reset về đầu
          }, maxDuration);
        }
      })
      .catch((err) => console.error("Error playing audio:", err));
  };

  const moveCharacter = async (path) => {
    // Hàm di chuyển nhân vật theo đường dẫn đã cho
    setIsMoving(true); // Đặt trạng thái di chuyển là true
    playSound("/sheepgame/sounds/sheep-baa.mp3", 1, 2000);
    for (let i = 0; i < path.length; i++) {
      // Lặp qua từng điểm trong đường dẫn
      const nextPoint = levelPoints.find((p) => p.id === path[i]); // Tìm điểm tiếp theo trong danh sách điểm
      await new Promise((res) => {
        // Chờ 2 giây trước khi di chuyển đến điểm tiếp theo
        setCharacterPos({ x: nextPoint.x, y: nextPoint.y }); // Cập nhật vị trí nhân vật
        setTimeout(res, 2000);
      });
      setCurrentLevelId(nextPoint.id); // Cập nhật ID cấp độ hiện tại
    }
    setIsMoving(false); // Đặt trạng thái di chuyển là false
    playSound("/sheepgame/sounds/sheep-baa.mp3", 1, 2000);
    const finalPoint = levelPoints.find((p) => p.id === path[path.length - 1]); // Lấy điểm cuối cùng trong đường dẫn
    setSelectedGame(finalPoint); // Cập nhật trò chơi đã chọn
    setShowInstruction(true); // Hiển thị hướng dẫn cho trò chơi đã chọn
  };

  const handlePointClick = (point) => {
    // Hàm xử lý khi người dùng click vào một điểm trên bản đồ
    if (!point.unlocked || point.id === currentLevelId || isMoving) return; // Nếu điểm không mở khóa, đã ở cấp độ đó hoặc đang di chuyển thì không làm gì cả
    const step = point.id > currentLevelId ? 1 : -1; // Xác định bước di chuyển dựa trên ID của điểm
    const path = []; // Tạo mảng để lưu đường dẫn di chuyển
    for (
      // Tạo đường dẫn từ cấp độ hiện tại đến điểm đã click
      let i = currentLevelId + step; // Bắt đầu từ cấp độ hiện tại cộng với bước
      step > 0 ? i <= point.id : i >= point.id; // Tiếp tục cho đến khi đạt đến điểm đã click
      i += step // Tăng hoặc giảm ID tùy theo bước
    ) {
      path.push(i); // Thêm ID vào đường dẫn
    }
    setPathQueue(path); // Cập nhật hàng đợi đường dẫn để di chuyển
  };

  useEffect(() => {
    // Khi component được mount, đặt trò chơi đã chọn là điểm đầu tiên
    if (pathQueue.length > 0 && !isMoving) {
      // Nếu có đường dẫn trong hàng đợi và không đang di chuyển
      moveCharacter(pathQueue); // Di chuyển nhân vật theo đường dẫn
      setPathQueue([]); // Đặt lại hàng đợi đường dẫn
    }
  }, [pathQueue, isMoving]); // Theo dõi sự thay đổi của pathQueue và isMoving

  const handlePlay = () => {
    // Hàm xử lý khi người dùng click nút "Play" trong hướng dẫn
    if (selectedGame?.name === "SheepCounting") {
      // Nếu trò chơi đã chọn là SheepCounting
      navigate("/sheep-intro");
    } else if (selectedGame?.name === "SheepColorCounting") {
      // Nếu trò chơi đã chọn là SheepColorCounting
      navigate("/sheep-color-intro");
    } else if (selectedGame?.name === "SheepMemoryMatch") {
      // Nếu trò chơi đã chọn là SheepMemoryMatch
      navigate("/sheep-memory-intro");
    } else if (selectedGame?.name === "SheepPatternRecognition") {
      // Nếu trò chơi đã chọn là SheepPatternRecognition
      navigate("/sheep-pattern-intro");
    }
  };

  return (
    <div style={styles.container}>
      <SoundToggleButton /> {/* Nút bật/tắt âm thanh */}
      {/* nút đăng xuất */}
      <button onClick={logout} style={styles.logoutButton}>
        <span style={{ color: "green" }}>Logout</span>
      </button>
      {/* hình ảnh chú cừu di chuyển */}
      <motion.img
        src="/sheepgame/images/sheep-left.png"
        alt="Character"
        style={styles.character}
        animate={{
          left: `${characterPos.x}%`,
          top: `${characterPos.y}%`,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Hiển thị các điểm trên bản đồ */}
      {levelPoints.map((point) => (
        <div
          key={point.id}
          onClick={() => handlePointClick(point)}
          onMouseEnter={() => {
            // Hiển thị thông tin điểm khi hover
            if (!point.unlocked) setHoveredLockedPoint(point); // Hiển thị thông tin điểm bị khóa khi hover
          }}
          onMouseLeave={() => {
            if (!point.unlocked) setHoveredLockedPoint(null); // Ẩn thông tin điểm bị khóa khi không hover
          }}
          style={
            point.isFinal ? styles.finalPoint(point) : styles.levelPoint(point)
          } // Sử dụng style riêng cho điểm cuối
        >
          {point.isFinal ? (
            <img
              src="/sheepgame/images/victory-cup.png"
              alt="Victory Cup"
              style={styles.cupImage}
            />
          ) : (
            point.id
          )}
        </div>
      ))}
      <AnimatePresence mode="wait">
        {/* Hiển thị hướng dẫn khi có trò chơi đã chọn */}
        {showInstruction && selectedGame && (
          <motion.div
            key={selectedGame.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.instructionModal(selectedGame)}
          >
            {selectedGame.isFinal ? (
              <>
                <h2 style={{ color: "#ff9800", marginBottom: "10px" }}>
                  Congratulations! 🎉
                </h2>
                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  You’ve completed all games!
                </p>
                <p style={{ fontSize: "0.95rem" }}>
                  Great job, little champion 🐑🌟
                </p>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: "12px" }}>Instructions</h2>
                <p style={{ marginBottom: "20px" }}>
                  Get ready to play <strong>{selectedGame.name}</strong>!
                </p>
                <p style={{ marginBottom: "20px" }}>
                  Total Score: <strong>{selectedGame.totalScore}</strong>
                </p>
                <button onClick={handlePlay} style={styles.playButton}>
                  Play
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {/* hướng dẫn cho điểm bị khóa */}
        {hoveredLockedPoint && (
          <motion.div
            key={"locked-" + hoveredLockedPoint.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.instructionModal(hoveredLockedPoint)}
          >
            <h4 style={{ marginBottom: "10px", color: "red" }}>Locked</h4>
            <p style={{ marginBottom: "5px", fontSize: "0.9rem" }}>
              To unlock <strong>{hoveredLockedPoint.name}</strong>:
            </p>
            <p style={{ fontSize: "0.85rem" }}>
              Score ≥ <strong>50</strong> in previous game
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameMap;

const styles = {
  container: {
    fontFamily: "Comic Sans MS, sans-serif",
    position: "relative",
    width: "100vw",
    height: "100vh",
    backgroundImage: 'url("/sheepgame/images/grass.png")',
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

  finalPoint: (point) => ({
    position: "absolute",
    left: `${point.x}%`,
    top: `${point.y}%`,
    transform: "translate(-50%, -50%)",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: point.unlocked ? "pointer" : "not-allowed",
    zIndex: 5,
    opacity: point.unlocked ? 1 : 0.5, // Thêm opacity khi locked
    boxShadow: point.unlocked
      ? "0 0 15px 5px rgba(255, 215, 0, 0.7), 0 0 25px 10px rgba(255, 215, 0, 0.4)"
      : "none",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: point.unlocked
        ? "translate(-50%, -50%) scale(1.15)"
        : "translate(-50%, -50%)",
      boxShadow: point.unlocked
        ? "0 0 20px 8px rgba(255, 215, 0, 0.9), 0 0 30px 15px rgba(255, 215, 0, 0.5)"
        : "none",
      opacity: point.unlocked ? 1 : 0.5, // Giữ nguyên opacity khi hover nếu locked
    },
    animation: point.unlocked ? "glow 2s infinite alternate" : "none",
  }),

  cupImage: {
    width: "10vw",
    height: "auto",
    objectFit: "contain",
    filter: (point) =>
      !point.unlocked ? "grayscale(100%) brightness(0.5)" : "none",
    transition: "all 0.3s ease",
    // Thêm opacity cho hình ảnh để đồng bộ
    opacity: (point) => (point.unlocked ? 1 : 0.7),
  },

  // Keyframes
  "@keyframes glow": {
    from: {
      boxShadow:
        "0 0 10px 2px rgba(255, 215, 0, 0.7), 0 0 20px 5px rgba(255, 215, 0, 0.4)",
    },
    to: {
      boxShadow:
        "0 0 20px 8px rgba(255, 215, 0, 0.9), 0 0 30px 12px rgba(255, 215, 0, 0.6)",
    },
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
