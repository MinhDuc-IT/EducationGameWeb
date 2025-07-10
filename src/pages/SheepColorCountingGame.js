// SheepCountingGame.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, color } from "framer-motion";
import SoundToggleButton from "../components/SoundToggleButton";
import Character from "../components/Character";
import Sheep from "../components/Sheep";
import Option from "../components/Option";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import GameStats from "../components/GameStats";

const names = ["Luna", "Max", "Olivia", "Leo", "Emma", "Noah", "Mia", "Ethan"]; // Danh sách tên nhân vật
const characterImages = { // Đường dẫn đến hình ảnh nhân vật
  Luna: "/images/character-luna.png",
  Max: "/images/character-max.png",
  Olivia: "/images/character-olivia.png",
  Leo: "/images/character-leo.png",
  Emma: "/images/character-emma.png",
  Noah: "/images/character-noah.png",
  Mia: "/images/character-mia.png",
  Ethan: "/images/character-ethan.png",
};

const MAX_ROUNDS = 5; // Số vòng chơi tối đa

function SheepCountingGame() {
  const navigate = useNavigate(); // Dùng để điều hướng đến các trang khác
  const [round, setRound] = useState(1); // Biến đếm số vòng chơi
  const [name, setName] = useState(""); // Tên của nhân vật hiện tại
  const [count, setCount] = useState(0); // Số lượng cừu cần đếm
  const [clickedSheep, setClickedSheep] = useState([]); // Mảng lưu trữ các cừu đã được click
  const [sheepPositions, setSheepPositions] = useState([]); // Vị trí của các cừu
  const [options, setOptions] = useState([]); // Mảng các lựa chọn số lượng cừu (bao gồm cả đáp án đúng và các đáp án sai)
  const [selectedWrong, setSelectedWrong] = useState([]); // Mảng lưu trữ các lựa chọn sai đã được chọn
  const [message, setMessage] = useState(""); // Thông điệp hiển thị cho người chơi
  const [showOptions, setShowOptions] = useState(false); // Biến để hiển thị các lựa chọn số lượng cừu
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false); // Cờ để xác định đã phát âm thanh giới thiệu hay chưa
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false); // Cờ để xác định có nên phát âm thanh câu hỏi hay không
  const [shouldSpeakIntro, setShouldSpeakIntro] = useState(false); // Cờ để xác định có nên phát âm thanh giới thiệu hay không
  const [hideCorrectAnswer, setHideCorrectAnswer] = useState(false); // Biến để ẩn đáp án đúng sau khi người chơi chọn đúng
  const [showCharacter, setShowCharacter] = useState(true); // Biến để hiển thị nhân vật
  const [startTime, setStartTime] = useState(null); // Thời gian bắt đầu của phiên chơi game
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0); // Biến đếm số lần người chơi chọn đúng ngay lần đầu tiên
  const [correctSecondTryCount, setCorrectSecondTryCount] = useState(0); // Biến đếm số lần người chơi chọn đúng sau khi đã chọn sai một lần
  const [totalWrongCount, setTotalWrongCount] = useState(0); // Biến đếm tổng số lần người chơi chọn sai
  const [currentWrongCount, setCurrentWrongCount] = useState(0); // Biến đếm số lần người chơi chọn sai trong vòng hiện tại
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Biến để hiển thị modal xác nhận khi người chơi muốn thoát

  const [targetColor, setTargetColor] = useState("red"); // màu cần đếm
  const [coloredSheepCount, setColoredSheepCount] = useState(0); // số lượng cừu có màu đó
  const [colorMap, setColorMap] = useState([]); // mảng boolean, true là cừu màu

  useEffect(() => { // khi component mount, bắt đầu vòng chơi mới
    startNewRound();
    setStartTime(new Date().toISOString()); // khi component mount, lưu thời gian bắt đầu
  }, []);

  useEffect(() => { 
    if (shouldSpeakIntro) {
      speak(
        "Click on the sheep to count them. Then, select the correct number.",
        1.2,
        1.6
      );
      setShouldSpeakIntro(false);
      setTimeout(() => setShouldSpeakQuestion(true), 4000);
    } else if (shouldSpeakQuestion) {
      setTimeout(() => {
        //speak(`How many sheep does ${name} have?`, 1, 1.5);
        speak(`How many ${targetColor} sheep does ${name} have?`, 1, 1.5);
      }, 3000);
      setShouldSpeakQuestion(false);
    }
  }, [shouldSpeakIntro, shouldSpeakQuestion, name]); // Khi có thay đổi về cờ phát âm thanh giới thiệu hoặc câu hỏi, sẽ phát âm thanh tương ứng

  const speak = (text, rate = 1, pitch = 1) => { // Hàm phát âm thanh
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

  const submitGameSession = async ( // Hàm gửi thông tin phiên chơi game lên server
    startTime,
    endTime,
    gameType = "SheepColorCounting",
    maxRounds,
    correctFirstTry,
    correctSecondTry,
    totalWrongAnswers
  ) => {
    try {
      console.log("Submitting game session...");
      console.log("Start Time:", startTime);
      console.log("End Time:", endTime);
      console.log("Game Type:", gameType);
      console.log("Max Rounds:", maxRounds);
      console.log("Correct First Try Count:", correctFirstTry);
      console.log("Correct Second Try Count:", correctSecondTry);
      console.log("Total Wrong Answers Count:", totalWrongAnswers);

      await api.post("/GameSession/create", {
        //userId,
        startTime,
        endTime,
        gameType,
        maxRounds,
        correctFirstTry,
        correctSecondTry,
        totalWrongAnswers,
      });
    } catch (error) {
      console.error("Error submitting game session:", error);
    }
  };

  const colors = ["red", "blue", "green", "yellow", "purple"]; // Danh sách các màu sắc có thể chọn
  const getRandomColor = () => // Hàm lấy ngẫu nhiên một màu từ danh sách
    colors[Math.floor(Math.random() * colors.length)];

  const startNewRound = () => { // Hàm bắt đầu một vòng chơi mới
    if (round > MAX_ROUNDS) { // Nếu đã chơi đủ số vòng, kết thúc trò chơi
      speak("Great job!", 1.1, 1.6);
      setTimeout(() => {
        speak(
          "You counted all the sheep! Do you want to play again?",
          1.1,
          1.6
        );
        navigate("/sheep-intro"); // Điều hướng về trang giới thiệu
      }, 2000);
      return;
    }

    // nếu chưa chơi đủ số vòng, reset các biến và bắt đầu vòng mới

    playSound("/sounds/footsteps.mp3", 1);
    playSound("/sounds/sheep-baa2.mp3", 1);

    const totalSheepCount = Math.floor(Math.random() * 10) + 1; // Số lượng cừu ngẫu nhiên từ 1 đến 10
    const coloredSheepCount = Math.floor(Math.random() * totalSheepCount) + 1; // Số lượng cừu có màu đặc biệt, ít nhất là 1 và không vượt quá tổng số cừu
    const targetColor = getRandomColor(); // Chọn ngẫu nhiên một màu từ danh sách
    const newName = names[Math.floor(Math.random() * names.length)]; // Chọn ngẫu nhiên một tên từ danh sách
    const wrongOptions = generateWrongOptions(coloredSheepCount); // Tạo các lựa chọn sai, đảm bảo không trùng với đáp án đúng
    const newPositions = generateNonOverlappingPositions(totalSheepCount, []); // Tạo các vị trí ngẫu nhiên cho các cừu, đảm bảo không trùng lặp

    // Tạo mảng cừu màu (true là cừu màu đặc biệt, false là mặc định)
    const colorMap = shuffleArray([
      ...Array(coloredSheepCount).fill(true),
      ...Array(totalSheepCount - coloredSheepCount).fill(false),
    ]);

    setName(newName); // Cập nhật tên nhân vật
    setTargetColor(targetColor); // Cập nhật màu cần đếm
    setColoredSheepCount(coloredSheepCount); // Cập nhật số lượng cừu có màu đặc biệt
    setColorMap(colorMap); // Cập nhật mảng cừu màu
    setClickedSheep([]); // Reset mảng cừu đã click
    setSelectedWrong([]); // Reset mảng lựa chọn sai đã chọn
    setMessage(""); // Reset thông điệp hiển thị
    setOptions(shuffleArray([coloredSheepCount, ...wrongOptions])); // Cập nhật các lựa chọn số lượng cừu, bao gồm đáp án đúng và các đáp án sai
    setShowOptions(false); // Ẩn các lựa chọn số lượng cừu
    setHideCorrectAnswer(false);
    setSheepPositions(newPositions); // Cập nhật vị trí của các cừu
    setShowCharacter(true);

    if (!hasSpokenIntro) {
      setShouldSpeakIntro(true);
      setHasSpokenIntro(true);
    } else {
      setShouldSpeakQuestion(true);
    }
  };

  const generateWrongOptions = (correct) => { // Hàm tạo các lựa chọn sai cho số lượng cừu
    let wrongs = new Set(); // Sử dụng Set để đảm bảo các lựa chọn sai không trùng lặp
    while (wrongs.size < 2) { // Tạo 2 lựa chọn sai
      const n = Math.floor(Math.random() * 10) + 1;
      if (n !== correct) wrongs.add(n);
    }
    return Array.from(wrongs);
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5); // Hàm trộn ngẫu nhiên mảng

  const generateNonOverlappingPositions = (n) => { // Hàm tạo các vị trí ngẫu nhiên cho các cừu, đảm bảo không trùng lặp
    const positions = []; // Mảng lưu trữ các vị trí đã tạo
    while (positions.length < n) { // Trong khi chưa đủ số lượng cừu
      const pos = getRandomPosition(); // Tạo một vị trí ngẫu nhiên
      const isOverlapping = positions.some( // Kiểm tra xem vị trí này có trùng lặp với các vị trí đã tạo hay không
        (p) =>
          Math.abs(parseFloat(p.left) - parseFloat(pos.left)) < 12 &&
          Math.abs(parseFloat(p.top) - parseFloat(pos.top)) < 12
      ); // Kiểm tra khoảng cách giữa các vị trí
      if (!isOverlapping) { // Nếu vị trí không trùng lặp
        positions.push(pos); // thêm vị trí vào mảng
      }
    }
    return positions;
  };

  const getRandomPosition = () => { // Hàm tạo một vị trí ngẫu nhiên cho cừu
    const x = Math.random() * 80 + 10; // Tọa độ x ngẫu nhiên từ 10% đến 90% chiều rộng
    const y = Math.random() * 30 + 60; // Tọa độ y ngẫu nhiên từ 60% đến 90% chiều cao
    return { left: `${x}%`, top: `${y}%` }; 
  };

  const handleSheepClick = (index) => { // Hàm xử lý khi người chơi click vào cừu
    if (!clickedSheep.includes(index)) { // Nếu cừu chưa được click
      playSound("/sounds/sheep-baa.mp3", 1); 
      const newClicked = [...clickedSheep, index]; // Thêm cừu vào mảng đã click
      if (colorMap[index]) {  // Nếu cừu có màu đặc biệt
        setClickedSheep(newClicked);  // Cập nhật mảng cừu đã click
      }

      //speak(newClicked.length.toString(), 1.3, 1.6);

      const newPositions = sheepPositions.map((pos, i) => { // Cập nhật vị trí của các cừu
        if (newClicked.includes(i)) return pos; // Nếu cừu đã click, giữ nguyên vị trí
        let newPos; // Tạo một vị trí mới cho cừu chưa click
        do {
          newPos = getRandomPosition(); // Tạo một vị trí ngẫu nhiên
        } while ( // Kiểm tra xem vị trí mới có trùng lặp với các cừu đã click hay không
          newClicked.some((clickedIdx) => { // Duyệt qua các cừu đã click
            const clickedPos = sheepPositions[clickedIdx]; // Lấy vị trí của cừu đã click
            return (
              Math.abs(parseFloat(clickedPos.left) - parseFloat(newPos.left)) <
                12 &&
              Math.abs(parseFloat(clickedPos.top) - parseFloat(newPos.top)) < 12
            ); // Kiểm tra khoảng cách giữa vị trí mới và vị trí của cừu đã click
          })
        );
        return newPos;
      });

      setSheepPositions(newPositions); // Cập nhật vị trí của các cừu

      if (newClicked.filter((i) => colorMap[i]).length === coloredSheepCount) { // Nếu người chơi đã click đủ số lượng cừu có màu đặc biệt
        setShowOptions(true); // Hiển thị các lựa chọn số lượng cừu
      }
    }
  };

  const handleOptionClick = (number) => { // Hàm xử lý khi người chơi click vào một lựa chọn số lượng cừu
    let newTotalWrongCount = totalWrongCount; // Biến để lưu trữ tổng số lần người chơi chọn sai
    if (!showOptions) return; // Nếu chưa hiển thị các lựa chọn, không làm gì cả
    if (number === coloredSheepCount) { // Nếu người chơi chọn đúng số lượng cừu có màu đặc biệt
      playSound("/sounds/success.mp3", 1);
      setTimeout(() => speak("Exactly!", 1, 1.8), 1000);
      setMessage("🎉 Exactly!");
      setSelectedWrong(options.filter((opt) => opt !== number)); // Lọc các lựa chọn sai đã chọn

      let newFirstTryCount = correctFirstTryCount; // Biến để lưu trữ số lần người chơi chọn đúng ngay lần đầu tiên
      let newSecondTryCount = correctSecondTryCount; // Biến để lưu trữ số lần người chơi chọn đúng sau khi đã chọn sai một lần

      if (currentWrongCount === 0) { // Nếu người chơi chọn đúng ngay lần đầu tiên
        newFirstTryCount += 1; // Tăng số lần chọn đúng ngay lần đầu tiên
        setCorrectFirstTryCount(newFirstTryCount);
        console.log("Correct on first try:", newFirstTryCount);
      } else if (currentWrongCount === 1) { // Nếu người chơi đã chọn sai một lần trước khi chọn đúng
        newSecondTryCount += 1; // Tăng số lần chọn đúng sau khi đã chọn sai một lần
        setCorrectSecondTryCount(newSecondTryCount);
        console.log("Correct on second try:", newSecondTryCount);
      }

      setCurrentWrongCount(0); // reset cho vòng sau

      setTimeout(() => setHideCorrectAnswer(true), 1500);

      if (round >= MAX_ROUNDS) { // Nếu đã chơi đủ số vòng, kết thúc trò chơi
        const endTime = new Date().toISOString(); // thời gian kết thúc
        //const userId = localStorage.getItem("userId");

        console.log("Game completed. Submitting results...");
        //console.log("User ID:", userId);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Correct First Try Count:", correctFirstTryCount);
        console.log("Correct Second Try Count:", correctSecondTryCount);
        console.log("Total Wrong Count:", totalWrongCount);

        submitGameSession( // Hàm gửi thông tin phiên chơi game lên server
          //userId,
          startTime,
          endTime,
          "SheepColorCounting",
          MAX_ROUNDS,
          newFirstTryCount,
          newSecondTryCount,
          newTotalWrongCount
        );

        setTimeout(() => {
          speak("Great job!", 1.1, 1.6);
          setTimeout(() => {
            speak(
              "You counted all the sheep! Do you want to play again?",
              1.1,
              1.6
            );
            navigate("/sheep-color-intro"); // Điều hướng về trang giới thiệu
          }, 2000);
        }, 1800);
      } else { // Nếu chưa đủ số vòng, bắt đầu vòng chơi mới
        // Animate thoát
        setTimeout(() => setShowCharacter(false), 1800);
        setTimeout(() => {
          setMessage("");
          setRound((prev) => prev + 1); // Tăng số vòng chơi
          startNewRound(); // Bắt đầu vòng chơi mới
        }, 2200);
      }
    } else { // Nếu người chơi chọn sai số lượng cừu
      playSound("/sounds/fail.mp3", 1);
      setTimeout(() => speak("Try again", 1.0, 1.2), 1000);
      setMessage("❌ Try again");
      setSelectedWrong([...selectedWrong, number]); // Thêm lựa chọn sai vào mảng đã chọn
      setCurrentWrongCount((prev) => prev + 1); // Tăng số lần người chơi chọn sai trong vòng hiện tại
      setTotalWrongCount((prev) => prev + 1); // Tăng tổng số lần người chơi chọn sai
      newTotalWrongCount = totalWrongCount + 1; 
      console.log("Total wrong count:", newTotalWrongCount);
    }
  };

  const playSound = (src, volume = 1) => { // Hàm phát âm thanh
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  const handleExitClick = () => { // Hàm xử lý khi người chơi muốn thoát trò chơi
    const confirmed = window.confirm(
      "Do you want to cancel this game session? Your progress will not be saved."
    );
    if (confirmed) {
      navigate("/sheep-intro");
    }
  };

  const colorStyles = { // Định dạng màu sắc cho các cừu
    red: {
      color: "#e53935",
      textShadow: "2px 2px 4px rgba(229, 57, 53, 0.6)",
      size: "2.5rem",
    },
    blue: {
      color: "#1e88e5",
      textShadow: "2px 2px 4px rgba(30, 136, 229, 0.6)",
      size: "2.5rem",
    },
    green: {
      color: "#43a047",
      textShadow: "2px 2px 4px rgba(67, 160, 71, 0.6)",
      size: "2.5rem",
    },
    purple: {
      color: "#8e24aa",
      textShadow: "2px 2px 4px rgba(142, 36, 170, 0.6)",
      size: "2.5rem",
    },
    yellow: {
      color: "#fdd835",
      textShadow: "2px 2px 4px rgba(253, 216, 53, 0.6)",
      size: "2.5rem",
    },
    orange: {
      color: "#fb8c00",
      textShadow: "2px 2px 4px rgba(251, 140, 0, 0.6)",
      size: "2.5rem",
    },
    pink: {
      color: "#ec407a",
      textShadow: "2px 2px 4px rgba(236, 64, 122, 0.6)",
      size: "2.5rem",
    },
  };

  return ( // Giao diện chính của trò chơi
    <div style={styles.container}>
      {/* hình ảnh cừu bên trái */}
      <img
        src="/images/sheep-left.png"
        alt="Sheep Left"
        style={styles.sheepLeft}
      />
      {/* câu hỏi */}
      <motion.div
        key={name + round + "-question"}
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.5 }}
        style={styles.question}
      >
        How many{" "}
        <strong style={colorStyles[targetColor] || { color: "#000" }}>
          {targetColor}
        </strong>{" "}
        sheep does <strong>{name}</strong> have?
      </motion.div>

      {/* hướng dẫn */}
      <motion.div
        key="instruction"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.instruction}
      >
        Click on the sheep to count them. Then, select the correct number.
      </motion.div>

      {/* khu vực chơi game */}
      <div style={styles.field}>
        <AnimatePresence mode="wait">
          {/* nhân vật */}
          {showCharacter && (
            <Character
              key={name + round}
              name={name}
              src={characterImages[name] || ""}
              style={styles.characterImg}
            />
          )}
        </AnimatePresence>

        {/* hiển thị các cừu */}
        {sheepPositions.map((pos, i) => (
          <Sheep
            key={i}
            index={i}
            pos={pos}
            clicked={clickedSheep.includes(i)}
            onClick={() => handleSheepClick(i)}
            srcImg={
              colorMap[i]
                ? `/images/sheep-${targetColor}.png`
                : "/images/sheep.png"
            }
          />
        ))}

        <AnimatePresence>
          {/* hiển thị các lựa chọn số lượng cừu */}
          {showOptions && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.options}
            >
              {options.map((num) => (
                <Option
                  key={num}
                  num={num}
                  isCorrect={num === coloredSheepCount}
                  isWrong={selectedWrong.includes(num)}
                  hide={hideCorrectAnswer}
                  message={message}
                  onClick={handleOptionClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <SoundToggleButton /> {/* Nút bật/tắt âm thanh */}
      </div>
      
      {/* bảng hiển thị điểm lượt chơi hiện tại */}
      <GameStats
        startTime={startTime}
        round={round}
        maxRounds={MAX_ROUNDS}
        correctFirstTryCount={correctFirstTryCount}
        correctSecondTryCount={correctSecondTryCount}
      />

      {/* Nút thoát trò chơi */}
      <button onClick={() => setShowConfirmModal(true)} style={styles.button}>
        ⬅ Exit
      </button>
      {/* hộp thoại xác nhận exit */}
      <ConfirmModal
        visible={showConfirmModal}
        message="Do you want to cancel this game session? Your progress will not be saved."
        onConfirm={() => navigate("/sheep-color-intro")}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

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
  characterImg: {
    position: "absolute",
    top: "10vh",
    left: "5vw",
    width: "15vh",
    height: "auto",
    zIndex: 5,
    filter: "drop-shadow(0 8px 4px rgba(0, 0, 0, 0.3))",
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
  field: {
    position: "relative",
    width: "60vw",
    margin: "0 auto",
    height: "80vh",
    backgroundImage: "url(/images/grass.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "12px",
    overflow: "hidden",
    border: "5px solid rgb(69, 201, 75)",
    boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
  },
  options: {
    position: "absolute",
    bottom: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "30px",
    zIndex: 10,
  },
  button: {
    position: "absolute",
    top: "10%",
    left: "3%",
    transform: "translate(50%, -50%)",
    padding: "12px 24px",
    fontSize: "1.2rem",
    backgroundColor: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "background-color 0.3s",
    borderRadius: "50%",
  },
  buttonHover: {
    backgroundColor: "#00FF00",
  },
  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "16px",
    cursor: "pointer",
    zIndex: 100,
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: "30px 25px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center",
  },

  modalText: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#333",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },

  modalButton: {
    flex: 1,
    padding: "10px 0",
    fontSize: "16px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default SheepCountingGame;
