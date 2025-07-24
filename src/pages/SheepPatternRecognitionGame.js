// SheepCountingGame.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SoundToggleButton from "../components/SoundToggleButton";
import Character from "../components/Character";
import Sheep from "../components/Sheep";
import Option from "../components/Option";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import GameStats from "../components/GameStats";

const names = ["Luna", "Max", "Olivia", "Leo", "Emma", "Noah", "Mia", "Ethan"]; // danh sách tên nhân vật
const characterImages = {
  // ánh xạ tên nhân vật với hình ảnh
  Luna: "/sheepgame/images/character-luna.png",
  Max: "/sheepgame/images/character-max.png",
  Olivia: "/sheepgame/images/character-olivia.png",
  Leo: "/sheepgame/images/character-leo.png",
  Emma: "/sheepgame/images/character-emma.png",
  Noah: "/sheepgame/images/character-noah.png",
  Mia: "/sheepgame/images/character-mia.png",
  Ethan: "/sheepgame/images/character-ethan.png",
};

const MAX_ROUNDS = 5; // số vòng chơi tối đa

// Danh sách màu
const COLORS = ["red", "blue", "green", "yellow", "purple"];

// Tạo pattern theo quy luật và độ khó
function generatePattern(round) {
  const length = 4 + round; // tăng dần số lượng cừu
  const ruleType = round <= 2 ? "repeat" : "alternate"; // càng về sau càng khó
  const color1 = COLORS[Math.floor(Math.random() * COLORS.length)];
  let color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
  while (color2 === color1) {
    color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  const pattern = [];
  if (ruleType === "repeat") {
    for (let i = 0; i < length; i++) {
      pattern.push(i % 2 === 0 ? color1 : color2);
    }
  } else if (ruleType === "alternate") {
    const sequence = [color1, color2, color1];
    for (let i = 0; i < length; i++) {
      pattern.push(sequence[i % sequence.length]);
    }
  }

  const missingIndex = Math.floor(Math.random() * length);
  const correctAnswer = pattern[missingIndex];
  pattern[missingIndex] = null;

  const options = [correctAnswer];
  while (options.length < 3) {
    const randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (!options.includes(randColor)) {
      options.push(randColor);
    }
  }
  console.log("options: ", options);
  console.log("correntAnswer: ", correctAnswer);
  console.log("missingIndex: ", missingIndex);

  return {
    pattern,
    correctAnswer,
    options: shuffleArray(options),
    missingIndex,
  };
}

// Trộn mảng
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function SheepPatternRecognitionGame() {
  const navigate = useNavigate(); // dùng để điều hướng đến trang SheepIntro
  const [round, setRound] = useState(1); // vòng chơi hiện tại
  const [name, setName] = useState(""); // tên nhân vật hiện tại
  const [count, setCount] = useState(0); // số lượng cừu cần đếm
  const [options, setOptions] = useState([]); // các lựa chọn số lượng cừu (đáp án và các lựa chọn sai)
  const [selectedWrong, setSelectedWrong] = useState([]); // các lựa chọn sai đã được chọn
  const [message, setMessage] = useState(""); // thông báo hiển thị sau khi chọn đáp án
  const [showOptions, setShowOptions] = useState(true); // hiển thị các lựa chọn số lượng cừu
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false); // cờ để xác định đã phát âm thanh giới thiệu hay chưa
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false); // cờ để xác định có nên phát âm thanh câu hỏi hay không
  const [shouldSpeakIntro, setShouldSpeakIntro] = useState(false); // cờ để xác định có nên phát âm thanh giới thiệu hay không
  const [hideCorrectAnswer, setHideCorrectAnswer] = useState(false); // cờ để ẩn đáp án đúng sau khi chọn
  const [showCharacter, setShowCharacter] = useState(true); // hiển thị nhân vật
  const [startTime, setStartTime] = useState(null); // thời gian bắt đầu trò chơi
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0); // số lần chọn đúng ở lần thử đầu tiên
  const [correctSecondTryCount, setCorrectSecondTryCount] = useState(0); // số lần chọn đúng ở lần thử thứ hai
  const [totalWrongCount, setTotalWrongCount] = useState(0); // tổng số lần chọn sai
  const [currentWrongCount, setCurrentWrongCount] = useState(0); // số lần chọn sai trong vòng chơi hiện tại
  const [showConfirmModal, setShowConfirmModal] = useState(false); // hiển thị modal xác nhận khi người dùng muốn thoát trò chơi

  const [patternData, setPatternData] = useState([]);
  //const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [missingIndex, setMissingIndex] = useState(null);

  useEffect(() => {
    // khi component mount, bắt đầu vòng chơi mới
    startNewRound();
    setStartTime(new Date().toISOString()); // khi component mount, lưu thời gian bắt đầu
  }, []);

  useEffect(() => {
    // khi có sự thay đổi về tên nhân vật hoặc vòng chơi, phát âm thanh giới thiệu hoặc câu hỏi
    if (shouldSpeakIntro) {
      speak(
        "Recognize the pattern of sheep ,then select the correct color sheep.",
        1.2,
        1.6
      );
      setShouldSpeakIntro(false); // đặt lại cờ sau khi đã phát âm thanh giới thiệu
      setTimeout(() => setShouldSpeakQuestion(true), 4000);
    } else if (shouldSpeakQuestion) {
      // nếu cờ để phát âm thanh câu hỏi được đặt
      setTimeout(() => {
        speak(`Which color sheep should ${name} put in the mark question?`, 1, 1.5);
      }, 3000); // phát âm thanh câu hỏi sau 3 giây
      setShouldSpeakQuestion(false); // đặt lại cờ sau khi đã phát âm thanh câu hỏi
    }
  }, [shouldSpeakIntro, shouldSpeakQuestion, name]); // theo dõi sự thay đổi của các cờ và tên nhân vật

  const speak = (text, rate = 1, pitch = 1) => {
    // hàm để phát âm thanh
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

  const submitGameSession = async (
    // hàm để gửi thông tin phiên chơi game lên server
    startTime,
    endTime,
    gameType = "SheepPatternRecognition",
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

  const startNewRound = () => {
    // hàm để bắt đầu vòng chơi mới
    if (round > MAX_ROUNDS) {
      // nếu đã đạt đến số vòng chơi tối đa
      speak("Great job!", 1.1, 1.6);
      setTimeout(() => {
        speak(
          "You recognize all the sheep pattern! Do you want to play again?",
          1.1,
          1.6
        );
        navigate("/sheep-pattern-intro"); // điều hướng về trang SheepIntro
      }, 2000);
      return;
    }

    // nếu chưa đến số vòng chơi tối đa, reset các trạng thái
    playSound("/sheepgame/sounds/footsteps.mp3", 1);
    playSound("/sheepgame/sounds/sheep-baa2.mp3", 1);

    console.log("round: ", round);
    const pattern = generatePattern(round);
    setPatternData(pattern);
    console.log("patternData: ", patternData);

    setMissingIndex(pattern.missingIndex); // Cập nhật missingIndex từ pattern

    // Sinh đáp án đúng và các đáp án sai
    const correctColor = pattern.correctAnswer;
    const wrongOptions = generateWrongOptions(correctColor);
    const shuffledOptions = shuffleArray([correctColor, ...wrongOptions]);
    setOptions(shuffledOptions);
    

    const newName = names[Math.floor(Math.random() * names.length)]; // chọn ngẫu nhiên tên nhân vật từ danh sách

    setName(newName); // cập nhật tên nhân vật
    setSelectedWrong([]); // reset danh sách các lựa chọn sai đã chọn
    setMessage(""); // reset thông báo
    //setShowOptions(false); // ẩn các lựa chọn số lượng cừu
    setHideCorrectAnswer(false); // không ẩn đáp án đúng
    setShowCharacter(true); // hiển thị nhân vật

    if (!hasSpokenIntro) {
      setShouldSpeakIntro(true);
      setHasSpokenIntro(true);
    } else {
      setShouldSpeakQuestion(true);
    }
  };

  const sheepColors = ["red", "blue", "green", "yellow", "purple"]; // Danh sách các màu sắc có thể chọn

  const generateWrongOptions = (correctColor) => {
    const available = sheepColors.filter((color) => color !== correctColor);
    shuffleArray(available); // Trộn để chọn ngẫu nhiên
    return available.slice(0, 2); // Lấy 2 màu sai
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5); // hàm để xáo trộn mảng

  const handleOptionClick = (color) => {
    // hàm để xử lý khi người dùng click vào một lựa chọn số lượng cừu (đáp án hoặc lựa chọn sai)
    let newTotalWrongCount = totalWrongCount; // biến để lưu tổng số lần chọn sai
    //if (selectedAnswer !== null) return;
    //if (selectedAnswer === patternData.correctAnswer) return;
    
    if (!showOptions) return; // nếu chưa hiển thị các lựa chọn số lượng cừu thì không làm gì cả
    //setSelectedAnswer(color);
    const correctColor = patternData.correctAnswer;
    console.log("patternData[missingIndex]: ", patternData[missingIndex]);
    if (color === correctColor) {
      // nếu người dùng chọn đáp án đúng
      playSound("/sheepgame/sounds/success.mp3", 1);
      setTimeout(() => speak("Exactly!", 1, 1.8), 1000);
      setMessage("🎉 Exactly!");
      //setSelectedAnswer(null);
      setSelectedWrong(patternData.options.filter((opt) => opt !== color)); // lọc các lựa chọn sai đã chọn, chỉ giữ lại các lựa chọn đúng

      let newFirstTryCount = correctFirstTryCount; // số lần chọn đúng ở lần thử đầu tiên
      let newSecondTryCount = correctSecondTryCount; // số lần chọn đúng ở lần thử thứ hai

      if (currentWrongCount === 0) {
        // nếu không có lần chọn sai nào trong vòng chơi này
        newFirstTryCount += 1; // tăng số lần chọn đúng ở lần thử đầu tiên
        setCorrectFirstTryCount(newFirstTryCount);
        console.log("Correct on first try:", newFirstTryCount);
      } else if (currentWrongCount === 1) {
        // nếu có một lần chọn sai trong vòng chơi này
        newSecondTryCount += 1; // tăng số lần chọn đúng ở lần thử thứ hai
        setCorrectSecondTryCount(newSecondTryCount);
        console.log("Correct on second try:", newSecondTryCount);
      }

      setCurrentWrongCount(0); // reset cho vòng sau

      setTimeout(() => setHideCorrectAnswer(true), 1500); // ẩn đáp án đúng sau 1.5 giây

      if (round >= MAX_ROUNDS) {
        // nếu đã đạt đến số vòng chơi tối đa
        const endTime = new Date().toISOString(); // thời gian kết thúc
        //const userId = localStorage.getItem("userId");

        console.log("Game completed. Submitting results...");
        //console.log("User ID:", userId);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Correct First Try Count:", correctFirstTryCount);
        console.log("Correct Second Try Count:", correctSecondTryCount);
        console.log("Total Wrong Count:", totalWrongCount);

        submitGameSession(
          // gửi thông tin phiên chơi game lên server
          //userId,
          startTime,
          endTime,
          "SheepPatternRecognition",
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
            navigate("/sheep-pattern-intro"); // điều hướng về trang SheepIntro
          }, 2000);
        }, 1800);
      } else {
        // nếu chưa đạt đến số vòng chơi tối đa
        // Animate thoát
        setTimeout(() => setShowCharacter(false), 1800);
        setTimeout(() => {
          setMessage("");
          setRound((prev) => prev + 1); // tăng vòng chơi lên 1
          startNewRound(); // bắt đầu vòng chơi mới
        }, 2200);
      }
    } else {
      // nếu người dùng chọn một lựa chọn sai
      playSound("/sheepgame/sounds/fail.mp3", 1);
      setTimeout(() => speak("Try again", 1.0, 1.2), 1000);
      setMessage("❌ Try again");
      setSelectedWrong([...selectedWrong, color]); // thêm lựa chọn sai vào danh sách các lựa chọn sai đã chọn
      setCurrentWrongCount((prev) => prev + 1); // tăng số lần chọn sai trong vòng chơi hiện tại
      setTotalWrongCount((prev) => prev + 1); // tăng tổng số lần chọn sai
      newTotalWrongCount = totalWrongCount + 1;
      console.log("Total wrong count:", newTotalWrongCount);
    }
  };

  const playSound = (src, volume = 1) => {
    // hàm để phát âm thanh
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  return (
    // giao diện của trò chơi
    <div style={styles.container}>
      {/* hình ảnh con cừu bên trái */}
      <img
        src="/sheepgame/images/sheep-left.png"
        alt="Sheep Left"
        style={styles.sheepLeft}
      />
      {/* câu hỏi (hiệu ứng từ trái vào) */}
      <motion.div
        key={name + round + "-question"}
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.5 }}
        style={styles.question}
      >
        Which color sheep should <strong>{name}</strong> put in the mark question?
      </motion.div>

      {/* hướng dẫn (hiệu ứng từ dưới lên) */}
      <motion.div
        key="instruction"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.instruction}
      >
        Recognize the pattern of sheep ,then select the correct color sheep.
      </motion.div>

      {/* khung chơi game ở giữa, hình ảnh đồng cỏ */}
      <div style={styles.field}>
        <AnimatePresence mode="wait">
          {/* ảnh nhân vật */}
          {showCharacter && (
            <Character
              key={name + round}
              name={name}
              src={characterImages[name] || ""}
              style={styles.characterImg}
            />
          )}
        </AnimatePresence>
        {/* Hiển thị hàng cừu pattern */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: "15vw",
            top: "45vh",
            margin: "5vh auto",
          }}
        >

          {patternData &&
            Array.isArray(patternData.pattern) &&
            patternData.pattern.map((color, index) => {
              if (index === patternData.missingIndex) {
                return (
                  <Sheep
                    key={index}
                    index={index}
                    pos={{ top: 0, left: `${index * 12}vh` }}
                    clicked={false}
                    onClick={() => {}}
                    srcImg={`/sheepgame/images/question-mark.png`}
                  />
                );
              }

              return (
                <Sheep
                  key={index}
                  index={index}
                  pos={{ top: 0, left: `${index * 12}vh` }}
                  clicked={false}
                  onClick={() => {}}
                  srcImg={`/sheepgame/images/sheep-${color}.png`}
                />
              );
            })}
        </div>
        {/* hiển thị các lựa chọn số lượng cừu (đáp án và các lựa chọn sai) */}
        <AnimatePresence>
          {showOptions && patternData && patternData.options && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.options}
            >
              {patternData.options.map((option, index) => (
                <Option
                  key={index}
                  num={option}
                  isCorrect={option === patternData.correctAnswer}
                  isWrong={selectedWrong.includes(option)}
                  hide={hideCorrectAnswer}
                  message={message}
                  onClick={handleOptionClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <SoundToggleButton /> {/* nút bật/tắt âm thanh */}
      </div>
      {/* hiển thị thông tin phiên chơi game */}
      <GameStats
        startTime={startTime}
        round={round}
        maxRounds={MAX_ROUNDS}
        correctFirstTryCount={correctFirstTryCount}
        correctSecondTryCount={correctSecondTryCount}
      />

      {/* nút thoát trò chơi */}
      <button onClick={() => setShowConfirmModal(true)} style={styles.button}>
        ⬅ Exit
      </button>
      {/* hộp thoại xác nhận thoát trò chơi */}
      <ConfirmModal
        visible={showConfirmModal}
        message="Do you want to cancel this game session? Your progress will not be saved."
        onConfirm={() => navigate("/sheep-pattern-intro")}
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
    backgroundImage: "url(/sheepgame/images/grass.png)",
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
    backgroundImage: "url(/sheepgame/images/grass.png)",
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

export default SheepPatternRecognitionGame;
