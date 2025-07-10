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
const characterImages = { // ánh xạ tên nhân vật với hình ảnh
  Luna: "/images/character-luna.png",
  Max: "/images/character-max.png",
  Olivia: "/images/character-olivia.png",
  Leo: "/images/character-leo.png",
  Emma: "/images/character-emma.png",
  Noah: "/images/character-noah.png",
  Mia: "/images/character-mia.png",
  Ethan: "/images/character-ethan.png",
};

const MAX_ROUNDS = 5; // số vòng chơi tối đa

function SheepCountingGame() {
  const navigate = useNavigate(); // dùng để điều hướng đến trang SheepIntro
  const [round, setRound] = useState(1); // vòng chơi hiện tại
  const [name, setName] = useState(""); // tên nhân vật hiện tại
  const [count, setCount] = useState(0); // số lượng cừu cần đếm
  const [clickedSheep, setClickedSheep] = useState([]); // danh sách các cừu đã được click
  const [sheepPositions, setSheepPositions] = useState([]); // vị trí của các chú cừu
  const [options, setOptions] = useState([]); // các lựa chọn số lượng cừu (đáp án và các lựa chọn sai)
  const [selectedWrong, setSelectedWrong] = useState([]); // các lựa chọn sai đã được chọn
  const [message, setMessage] = useState(""); // thông báo hiển thị sau khi chọn đáp án
  const [showOptions, setShowOptions] = useState(false); // hiển thị các lựa chọn số lượng cừu
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false); // cờ để xác định đã phát âm thanh giới thiệu hay chưa
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false); // cờ để xác định có nên phát âm thanh câu hỏi hay không
  const [shouldSpeakIntro, setShouldSpeakIntro] = useState(false); // cờ để xác định có nên phát âm thanh giới thiệu hay không
  const [hideCorrectAnswer, setHideCorrectAnswer] = useState(false);  // cờ để ẩn đáp án đúng sau khi chọn
  const [showCharacter, setShowCharacter] = useState(true); // hiển thị nhân vật
  const [startTime, setStartTime] = useState(null); // thời gian bắt đầu trò chơi
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0); // số lần chọn đúng ở lần thử đầu tiên
  const [correctSecondTryCount, setCorrectSecondTryCount] = useState(0);  // số lần chọn đúng ở lần thử thứ hai
  const [totalWrongCount, setTotalWrongCount] = useState(0); // tổng số lần chọn sai
  const [currentWrongCount, setCurrentWrongCount] = useState(0); // số lần chọn sai trong vòng chơi hiện tại
  const [showConfirmModal, setShowConfirmModal] = useState(false); // hiển thị modal xác nhận khi người dùng muốn thoát trò chơi

  useEffect(() => { // khi component mount, bắt đầu vòng chơi mới
    startNewRound();
    setStartTime(new Date().toISOString()); // khi component mount, lưu thời gian bắt đầu
  }, []);

  useEffect(() => { // khi có sự thay đổi về tên nhân vật hoặc vòng chơi, phát âm thanh giới thiệu hoặc câu hỏi
    if (shouldSpeakIntro) {
      speak(
        "Click on the sheep to count them. Then, select the correct number.",
        1.2,
        1.6
      );
      setShouldSpeakIntro(false); // đặt lại cờ sau khi đã phát âm thanh giới thiệu
      setTimeout(() => setShouldSpeakQuestion(true), 4000);
    } else if (shouldSpeakQuestion) { // nếu cờ để phát âm thanh câu hỏi được đặt
      setTimeout(() => {
        speak(`How many sheep does ${name} have?`, 1, 1.5);
      }, 3000); // phát âm thanh câu hỏi sau 3 giây
      setShouldSpeakQuestion(false); // đặt lại cờ sau khi đã phát âm thanh câu hỏi
    }
  }, [shouldSpeakIntro, shouldSpeakQuestion, name]); // theo dõi sự thay đổi của các cờ và tên nhân vật

  const speak = (text, rate = 1, pitch = 1) => { // hàm để phát âm thanh
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

  const submitGameSession = async ( // hàm để gửi thông tin phiên chơi game lên server
    startTime,
    endTime,
    gameType = "SheepCounting",
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

  const startNewRound = () => { // hàm để bắt đầu vòng chơi mới
    if (round > MAX_ROUNDS) { // nếu đã đạt đến số vòng chơi tối đa
      speak("Great job!", 1.1, 1.6);
      setTimeout(() => {
        speak(
          "You counted all the sheep! Do you want to play again?",
          1.1,
          1.6
        );
        navigate("/sheep-intro"); // điều hướng về trang SheepIntro
      }, 2000);
      return;
    }

    // nếu chưa đến số vòng chơi tối đa, reset các trạng thái
    playSound("/sounds/footsteps.mp3", 1);
    playSound("/sounds/sheep-baa2.mp3", 1);
    
    const newCount = Math.floor(Math.random() * 10) + 1; // số lượng cừu ngẫu nhiên từ 1 đến 10
    const newName = names[Math.floor(Math.random() * names.length)]; // chọn ngẫu nhiên tên nhân vật từ danh sách
    const wrongOptions = generateWrongOptions(newCount); // tạo các lựa chọn sai (2 lựa chọn không trùng với số lượng cừu)
    const newPositions = generateNonOverlappingPositions(newCount, []); // tạo vị trí ngẫu nhiên cho các chú cừu, đảm bảo không trùng lặp

    setName(newName); // cập nhật tên nhân vật
    setCount(newCount); // cập nhật số lượng cừu
    setClickedSheep([]); // reset danh sách các cừu đã click
    setSelectedWrong([]); // reset danh sách các lựa chọn sai đã chọn
    setMessage(""); // reset thông báo
    setOptions(shuffleArray([newCount, ...wrongOptions])); // cập nhật các lựa chọn số lượng cừu (bao gồm đáp án đúng và các lựa chọn sai)
    setShowOptions(false); // ẩn các lựa chọn số lượng cừu
    setHideCorrectAnswer(false); // không ẩn đáp án đúng
    setSheepPositions(newPositions); // cập nhật vị trí của các chú cừu
    setShowCharacter(true); // hiển thị nhân vật

    if (!hasSpokenIntro) {
      setShouldSpeakIntro(true);
      setHasSpokenIntro(true);
    } else {
      setShouldSpeakQuestion(true);
    }
  };

  const generateWrongOptions = (correct) => { // hàm để tạo các lựa chọn sai (2 lựa chọn không trùng với số lượng cừu)
    let wrongs = new Set(); // sử dụng Set để đảm bảo các lựa chọn sai không trùng lặp
    while (wrongs.size < 2) { // tạo 2 lựa chọn sai
      const n = Math.floor(Math.random() * 10) + 1; // số lượng cừu ngẫu nhiên từ 1 đến 10
      if (n !== correct) wrongs.add(n); // nếu số lượng cừu không trùng với đáp án đúng thì thêm vào Set
    }
    return Array.from(wrongs); // chuyển Set thành mảng
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5); // hàm để xáo trộn mảng

  const generateNonOverlappingPositions = (n) => { // hàm để tạo vị trí ngẫu nhiên cho các chú cừu, đảm bảo không trùng lặp
    const positions = []; // mảng để lưu trữ các vị trí của các chú cừu
    while (positions.length < n) { // lặp cho đến khi đủ số lượng cừu
      const pos = getRandomPosition(); // lấy vị trí ngẫu nhiên
      const isOverlapping = positions.some( // kiểm tra xem vị trí này có trùng với vị trí nào đã có không
        (p) =>
          Math.abs(parseFloat(p.left) - parseFloat(pos.left)) < 12 &&
          Math.abs(parseFloat(p.top) - parseFloat(pos.top)) < 12
      ); // kiểm tra khoảng cách giữa các vị trí, nếu nhỏ hơn 12px thì coi là trùng lặp
      if (!isOverlapping) { // nếu không trùng lặp
        positions.push(pos); // thêm vị trí này vào mảng
      }
    }
    return positions; // trả về mảng các vị trí đã tạo
  };

  const getRandomPosition = () => { // hàm để lấy vị trí ngẫu nhiên cho các chú cừu
    const x = Math.random() * 80 + 10; // vị trí ngang ngẫu nhiên từ 10% đến 90% của khung chơi
    const y = Math.random() * 30 + 60; // vị trí dọc ngẫu nhiên từ 60% đến 90% của khung chơi (để nằm ở phần dưới của khung chơi)
    return { left: `${x}%`, top: `${y}%` };
  };

  const handleSheepClick = (index) => { // hàm để xử lý khi người dùng click vào một chú cừu
    if (!clickedSheep.includes(index)) { // nếu chú cừu chưa được click
      playSound("/sounds/sheep-baa.mp3", 1); 
      const newClicked = [...clickedSheep, index]; // thêm chú cừu vào danh sách các cừu đã click
      setClickedSheep(newClicked); // cập nhật danh sách các cừu đã click
      speak(newClicked.length.toString(), 1.3, 1.6); // phát âm thanh số lượng cừu đã click

      const newPositions = sheepPositions.map((pos, i) => { // cập nhật vị trí của các chú cừu
        if (newClicked.includes(i)) return pos; // nếu chú cừu đã được click thì giữ nguyên vị trí
        let newPos; 
        do { // nếu chú cừu chưa được click, tìm vị trí mới ngẫu nhiên
          newPos = getRandomPosition();
        } while ( // kiểm tra vị trí mới có trùng với các chú cừu đã click hay không
          newClicked.some((clickedIdx) => { // kiểm tra từng chú cừu đã click
            const clickedPos = sheepPositions[clickedIdx]; // lấy vị trí của chú cừu đã click
            return (
              Math.abs(parseFloat(clickedPos.left) - parseFloat(newPos.left)) <
                12 &&
              Math.abs(parseFloat(clickedPos.top) - parseFloat(newPos.top)) < 12
            ); // nếu khoảng cách giữa vị trí mới và vị trí của chú cừu đã click nhỏ hơn 12px thì coi là trùng lặp
          })
        );
        return newPos; // trả về vị trí mới nếu không trùng lặp
      });

      setSheepPositions(newPositions); // cập nhật vị trí của các chú cừu

      if (newClicked.length === count) { // nếu số lượng cừu đã click bằng với số lượng cừu cần đếm
        setShowOptions(true); // hiển thị các lựa chọn số lượng cừu (đáp án và các lựa chọn sai)
      }
    }
  };

  const handleOptionClick = (number) => { // hàm để xử lý khi người dùng click vào một lựa chọn số lượng cừu (đáp án hoặc lựa chọn sai)
    let newTotalWrongCount = totalWrongCount; // biến để lưu tổng số lần chọn sai
    if (!showOptions) return; // nếu chưa hiển thị các lựa chọn số lượng cừu thì không làm gì cả
    if (number === count) { // nếu người dùng chọn đáp án đúng
      playSound("/sounds/success.mp3", 1);
      setTimeout(() => speak("Exactly!", 1, 1.8), 1000);
      setMessage("🎉 Exactly!");
      setSelectedWrong(options.filter((opt) => opt !== number)); // lọc các lựa chọn sai đã chọn, chỉ giữ lại các lựa chọn đúng

      let newFirstTryCount = correctFirstTryCount; // số lần chọn đúng ở lần thử đầu tiên
      let newSecondTryCount = correctSecondTryCount; // số lần chọn đúng ở lần thử thứ hai

      if (currentWrongCount === 0) { // nếu không có lần chọn sai nào trong vòng chơi này
        newFirstTryCount += 1; // tăng số lần chọn đúng ở lần thử đầu tiên
        setCorrectFirstTryCount(newFirstTryCount); 
        console.log("Correct on first try:", newFirstTryCount);
      } else if (currentWrongCount === 1) { // nếu có một lần chọn sai trong vòng chơi này
        newSecondTryCount += 1; // tăng số lần chọn đúng ở lần thử thứ hai
        setCorrectSecondTryCount(newSecondTryCount);
        console.log("Correct on second try:", newSecondTryCount);
      }

      setCurrentWrongCount(0); // reset cho vòng sau

      setTimeout(() => setHideCorrectAnswer(true), 1500); // ẩn đáp án đúng sau 1.5 giây

      if (round >= MAX_ROUNDS) { // nếu đã đạt đến số vòng chơi tối đa
        const endTime = new Date().toISOString(); // thời gian kết thúc
        //const userId = localStorage.getItem("userId");

        console.log("Game completed. Submitting results...");
        //console.log("User ID:", userId);
        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);
        console.log("Correct First Try Count:", correctFirstTryCount);
        console.log("Correct Second Try Count:", correctSecondTryCount);
        console.log("Total Wrong Count:", totalWrongCount);

        submitGameSession( // gửi thông tin phiên chơi game lên server
          //userId,
          startTime,
          endTime,
          "SheepCounting",
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
            navigate("/sheep-intro"); // điều hướng về trang SheepIntro
          }, 2000);
        }, 1800);
      } else { // nếu chưa đạt đến số vòng chơi tối đa
        // Animate thoát
        setTimeout(() => setShowCharacter(false), 1800);
        setTimeout(() => {
          setMessage("");
          setRound((prev) => prev + 1); // tăng vòng chơi lên 1
          startNewRound();  // bắt đầu vòng chơi mới
        }, 2200);
      }
    } else { // nếu người dùng chọn một lựa chọn sai
      playSound("/sounds/fail.mp3", 1);
      setTimeout(() => speak("Try again", 1.0, 1.2), 1000);
      setMessage("❌ Try again");
      setSelectedWrong([...selectedWrong, number]); // thêm lựa chọn sai vào danh sách các lựa chọn sai đã chọn
      setCurrentWrongCount((prev) => prev + 1); // tăng số lần chọn sai trong vòng chơi hiện tại
      setTotalWrongCount((prev) => prev + 1); // tăng tổng số lần chọn sai
      newTotalWrongCount = totalWrongCount + 1; 
      console.log("Total wrong count:", newTotalWrongCount);
    }
  };

  const playSound = (src, volume = 1) => { // hàm để phát âm thanh
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  const handleExitClick = () => { // hàm để xử lý khi người dùng muốn thoát trò chơi
    const confirmed = window.confirm(
      "Do you want to cancel this game session? Your progress will not be saved."
    );
    if (confirmed) {
      navigate("/sheep-intro");
    }
  };

  return ( // giao diện của trò chơi
    <div style={styles.container}>
      {/* hình ảnh con cừu bên trái */}
      <img
        src="/images/sheep-left.png"
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
        How many sheep does <strong>{name}</strong> have?
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
        Click on the sheep to count them. Then, select the correct number.
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

        {/* hiển thị các chú cừu */}
        {sheepPositions.map((pos, i) => (
          <Sheep
            key={i}
            index={i}
            pos={pos}
            clicked={clickedSheep.includes(i)}
            onClick={() => handleSheepClick(i)}
          />
        ))}

        {/* hiển thị các lựa chọn số lượng cừu (đáp án và các lựa chọn sai) */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={styles.options}
            >
              {options.map((num) => ( // lặp qua các lựa chọn số lượng cừu
                <Option
                  key={num}
                  num={num}
                  isCorrect={num === count}
                  isWrong={selectedWrong.includes(num)}
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
        onConfirm={() => navigate("/sheep-intro")}
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
