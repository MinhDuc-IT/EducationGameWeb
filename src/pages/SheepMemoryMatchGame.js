// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import SoundToggleButton from "../components/SoundToggleButton";
// import Character from "../components/Character";

// // Danh sách màu
// const COLORS = ["red", "blue", "green", "yellow", "orange", "purple"];

// // Tạo pattern theo quy luật và độ khó
// function generatePattern(round) {
//   const length = 4 + round; // tăng dần số lượng cừu
//   const ruleType = round <= 2 ? "repeat" : "alternate"; // càng về sau càng khó
//   const color1 = COLORS[Math.floor(Math.random() * COLORS.length)];
//   let color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
//   while (color2 === color1) {
//     color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
//   }

//   const pattern = [];
//   if (ruleType === "repeat") {
//     for (let i = 0; i < length; i++) {
//       pattern.push(i % 2 === 0 ? color1 : color2);
//     }
//   } else if (ruleType === "alternate") {
//     const sequence = [color1, color2, color1];
//     for (let i = 0; i < length; i++) {
//       pattern.push(sequence[i % sequence.length]);
//     }
//   }

//   const missingIndex = Math.floor(Math.random() * length);
//   const correctAnswer = pattern[missingIndex];
//   pattern[missingIndex] = null;

//   const options = [correctAnswer];
//   while (options.length < 3) {
//     const randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
//     if (!options.includes(randColor)) {
//       options.push(randColor);
//     }
//   }

//   return {
//     pattern,
//     correctAnswer,
//     options: shuffleArray(options),
//     missingIndex,
//   };
// }

// // Trộn mảng
// function shuffleArray(array) {
//   return [...array].sort(() => Math.random() - 0.5);
// }

// export default function SheepPatternRecognitionGame() {
//   const navigate = useNavigate();
//   const [round, setRound] = useState(1);
//   const [patternData, setPatternData] = useState(null);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [showTryAgain, setShowTryAgain] = useState(false);

//   useEffect(() => {
//     setPatternData(generatePattern(round));
//     setSelectedAnswer(null);
//     setShowTryAgain(false);
//   }, [round]);

//   const handleAnswerClick = (color) => {
//     if (selectedAnswer !== null) return;

//     setSelectedAnswer(color);

//     if (color === patternData.correctAnswer) {
//       setTimeout(() => {
//         if (round >= 5) {
//           navigate("/sheepgame/result"); // Kết thúc game
//         } else {
//           setRound((prev) => prev + 1);
//         }
//       }, 1000);
//     } else {
//       setShowTryAgain(true);
//     }
//   };

//   if (!patternData) return null;

//   return (
//     <div style={styles.container}>
//       {/* nhân vật */}
//       <Character />
//       {/* nút âm thanh */}
//       <SoundToggleButton />

//       {/* câu hỏi */}
//       <motion.div
//         key={"question" + round}
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ duration: 0.3 }}
//         style={styles.question}
//       >
//         Chọn chú cừu còn thiếu theo quy luật
//       </motion.div>

//       {/* các đáp án (các quả bóng màu) */}
//       <div style={styles.answerContainer}>
//         {patternData.options.map((color, i) => (
//           <motion.div
//             key={i}
//             whileTap={{ scale: 0.9 }}
//             onClick={() => handleAnswerClick(color)}
//             style={{
//               ...styles.balloon,
//               backgroundColor: color,
//               opacity: selectedAnswer && selectedAnswer !== color ? 0.5 : 1,
//               cursor: selectedAnswer ? "default" : "pointer",
//             }}
//           />
//         ))}
//       </div>

//       {/* hiển thị dòng cừu theo pattern */}
//       <div style={styles.patternRow}>
//         {patternData.pattern.map((color, i) => (
//           <img
//             key={i}
//             src={
//               color
//                 ? `/sheepgame/images/sheep-${color}.png`
//                 : "/sheepgame/images/blank-sheep.png"
//             }
//             alt="Sheep"
//             style={styles.sheep}
//           />
//         ))}
//       </div>

//       {/* báo sai */}
//       {showTryAgain && (
//         <div style={styles.tryAgainText}>Sai rồi, thử lại nhé!</div>
//       )}
//     </div>
//   );
// }

// const styles = {
//   container: {
//     position: "relative",
//     width: "100vw",
//     height: "100vh",
//     backgroundColor: "#D6F6FF",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   question: {
//     fontSize: "2rem",
//     fontWeight: "bold",
//     marginBottom: "1rem",
//     color: "#333",
//   },
//   answerContainer: {
//     display: "flex",
//     gap: "1rem",
//     marginBottom: "2rem",
//   },
//   balloon: {
//     width: "60px",
//     height: "60px",
//     borderRadius: "50%",
//     border: "3px solid white",
//     boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
//   },
//   patternRow: {
//     display: "flex",
//     gap: "10px",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: "1rem",
//   },
//   sheep: {
//     width: "80px",
//     height: "80px",
//   },
//   tryAgainText: {
//     marginTop: "1.5rem",
//     fontSize: "1.5rem",
//     color: "red",
//     fontWeight: "bold",
//   },
// };






























import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SoundToggleButton from "../components/SoundToggleButton";
import Character from "../components/Character";
import GameStats from "../components/GameStats";
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";
import { ImTextColor } from "react-icons/im";
import PlayButton from "../components/PlayButton";
import { pre, sub } from "framer-motion/client";

const characterImages = {
  Luna: "/sheepgame/images/character-luna.png",
  Max: "/sheepgame/images/character-max.png",
  Olivia: "/sheepgame/images/character-olivia.png",
  Leo: "/sheepgame/images/character-leo.png",
  Emma: "/sheepgame/images/character-emma.png",
  Noah: "/sheepgame/images/character-noah.png",
  Mia: "/sheepgame/images/character-mia.png",
  Ethan: "/sheepgame/images/character-ethan.png",
}; // mảng chứa hình ảnh của các nhân vật

const MAX_ROUNDS = 5; // tổng số vòng chơi
const CARD_PAIRS = [2, 3, 4, 5, 6]; // số cặp thẻ trong mỗi vòng chơi
const allImages = ["red", "blue", "green", "yellow", "purple", "black"]; // mảng chứa các màu của ảnh
const PREVIEW_TIMES = [2000, 3000, 4000, 6000, 8000]; // thời gian preview cho mỗi vòng chơi

export default function SheepMemoryMatchGame() {
  const navigate = useNavigate(); // điều hướng đến trang khác
  const [round, setRound] = useState(1); // vòng chơi hiện tại
  const [name, setName] = useState(""); // tên của nhân vật
  const [cards, setCards] = useState([]); // mảng chứa các thẻ bài
  const [flipped, setFlipped] = useState([]); // mảng chứa các thẻ đã lật
  const [matched, setMatched] = useState([]); // mảng chứa các thẻ đã ghép đôi
  const [startTime, setStartTime] = useState(null); // thời gian bắt đầu chơi
  const [wrongCount, setWrongCount] = useState(0); // số lần sai
  const [showCharacter, setShowCharacter] = useState(true); // hiển thị nhân vật hay không
  const [showConfirmModal, setShowConfirmModal] = useState(false); // hiển thị modal xác nhận hay không
  const [shakingCardIndex, setShakingCardIndex] = useState(null); // thẻ đang rung
  const [shakingCardIndexes, setShakingCardIndexes] = useState([]); // preview toàn bộ khi bắt đầu mỗi vòng
  const [justMatched, setJustMatched] = useState([]); // các thẻ vừa ghép đôi, để tạo hiệu ứng nổi bật
  const [isReady, setIsReady] = useState(true); // trạng thái sẵn sàng để bắt đầu vòng chơi, khi nhấn play sẽ bắt đầu preview
  const [previewing, setPreviewing] = useState(false); // trạng thái preview các thẻ bài khi bắt đầu vòng chơi
  const [flipAttempts, setFlipAttempts] = useState({}); // số lần lật mỗi thẻ, để lưu trữ số lần lật của mỗi thẻ và tính điểm
  const [correctFirstTry, setCorrectFirstTry] = useState(0); // số lần ghép đúng ngay lần đầu tiên
  const [correctSecondTry, setCorrectSecondTry] = useState(0); // số lần ghép đúng lần thứ hai (sau khi sai lần đầu)
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false); // cờ để xác định có nên nói câu hỏi hay không
  const [shouldSpeakIntro, setShouldSpeakIntro] = useState(false); // cờ để xác định có nên nói lời giới thiệu hay không
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false); // cờ để xác định đã nói lời giới thiệu hay chưa (để tránh nói lại nhiều lần)

  useEffect(() => {
    if (shouldSpeakIntro) {
      // nếu cờ giới thiệu được bật
      speak(
        "Click on these bush to find pair of sheep. Match all sheep to complete each round.",
        1.2,
        1.6
      );
      setShouldSpeakIntro(false); // reset cờ sau khi nói xong
      setTimeout(() => setShouldSpeakQuestion(true), 4000); // đặt lại cờ để nói câu hỏi sau 4 giây
    } else if (shouldSpeakQuestion) {
      // nếu cờ câu hỏi được bật
      setTimeout(() => {
        speak(`Let's help ${name} match all the sheep`, 1, 1.5);
      }, 3000);
      setShouldSpeakQuestion(false); // reset cờ sau khi nói xong
    }
  }, [shouldSpeakIntro, shouldSpeakQuestion, name]); // theo dõi các cờ để nói lời giới thiệu hoặc câu hỏi

  const playSound = (src, volume = 1) => {
    // hàm để phát âm thanh file src với âm lượng volume
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  const speak = (text, rate = 1, pitch = 1) => {
    // hàm để nói một đoạn văn bản text với tốc độ rate và cao độ pitch nhất định
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US"; // ngôn ngữ của đoạn văn bản
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
    setStartTime(new Date().toISOString()); // lưu thời gian bắt đầu chơi
  }, []);

  useEffect(() => {
    playSound("/sheepgame/sounds/footsteps.mp3", 1); // phát âm thanh bước chân khi vào game
    if (!hasSpokenIntro) {
      // nếu chưa nói lời giới thiệu
      setShouldSpeakIntro(true); // bật cờ để nói lời giới thiệu
      setHasSpokenIntro(true); // đặt cờ đã nói lời giới thiệu để không nói lại nữa
    } else {
      setShouldSpeakQuestion(true); // bật cờ để nói câu hỏi
    }
    generateCards(); // tạo các thẻ bài mới cho vòng chơi hiện tại
    setTimeout(() => {
      setIsReady(true); // đặt trạng thái sẵn sàng để bắt đầu vòng chơi và hiển thị nút Play
    }, 2000);
  }, [round]);

  useEffect(() => {
    if (flipped.length === 2) {
      // nếu có 2 thẻ được lật
      const [firstIdx, secondIdx] = flipped; // lấy chỉ số của 2 thẻ được lật
      if (cards[firstIdx].image === cards[secondIdx].image) {
        // nếu 2 thẻ có cùng hình ảnh
        playSound("/sheepgame/sounds/success.mp3", 0.5); // phát âm thanh thành công
        const tries1 = flipAttempts[firstIdx] || 1; // lấy số lần lật của thẻ đầu tiên, nếu không có thì mặc định là 1
        const tries2 = flipAttempts[secondIdx] || 1; // lấy số lần lật của thẻ thứ hai, nếu không có thì mặc định là 1
        const maxTry = Math.max(tries1, tries2); // lấy số lần lật lớn nhất của 2 thẻ

        if (maxTry === 1) {
          // nếu lật đúng ngay lần đầu tiên
          setCorrectFirstTry((prev) => prev + 1); // tăng số lần ghép đúng ngay lần đầu tiên
        } else if (maxTry === 2) {
          // nếu lật đúng lần thứ hai (sau khi sai lần đầu)
          setCorrectSecondTry((prev) => prev + 1); // tăng số lần ghép đúng lần thứ hai
        }
        setMatched((prev) => [...prev, firstIdx, secondIdx]); // thêm các thẻ đã ghép đôi vào mảng matched
        setJustMatched([firstIdx, secondIdx]); // lưu các thẻ vừa ghép đôi để tạo hiệu ứng nổi bật
        setFlipped([]); // reset mảng flipped để chờ lật thẻ mới
        setTimeout(() => {
          setJustMatched([]); // xóa các thẻ vừa ghép đôi sau 1 giây để hiệu ứng nổi bật biến mất
        }, 1000);

        setFlipAttempts((prev) => {
          // cập nhật số lần lật của các thẻ đã ghép đôi
          const updated = { ...prev }; // sao chép mảng flipAttempts hiện tại
          delete updated[firstIdx]; // xóa thẻ đầu tiên khỏi mảng
          delete updated[secondIdx]; // xóa thẻ thứ hai khỏi mảng
          return updated; // trả về mảng đã cập nhật
        });

        if (matched.length + 2 === cards.length) {
          // nếu đã ghép đôi hết tất cả các thẻ
          if (round >= MAX_ROUNDS) {
            // nếu đã chơi đủ số vòng
            submitGameSession(
              // call hàm submitGameSession để lưu kết quả
              startTime,
              new Date().toISOString(),
              "SheepMemoryMatch",
              MAX_ROUNDS,
              correctFirstTry,
              correctSecondTry,
              wrongCount
            ).then(() => {
              setTimeout(() => {
                speak("Great job!", 1.1, 1.6);
                setTimeout(() => {
                  speak(
                    "You matched all the sheep! Do you want to play again?",
                    1.1,
                    1.6
                  );
                  navigate("/sheep-memory-intro"); // điều hướng về trang giới thiệu game
                }, 2000);
              }, 1800);
              //navigate("/sheep-memory-intro");
            });
          } else {
            // nếu chưa chơi đủ số vòng
            setTimeout(() => {
              playSound("/sheepgame/sounds/sheep-baa2.mp3", 0.5);
              setRound(round + 1); // tăng vòng chơi lên 1, chuyển sang vòng tiếp theo
            }, 1000);
          }
        }
      } else {
        // nếu 2 thẻ không cùng hình ảnh
        playSound("/sheepgame/sounds/fail.mp3", 0.5);
        setWrongCount((prev) => prev + 1); // tăng số lần sai lên 1
        setTimeout(() => setFlipped([]), 1000); // reset mảng flipped sau 1 giây để chờ lật thẻ mới (để người chơi có thời gian nhìn thấy thẻ đã lật rồi úp lại)
      }
    }
  }, [flipped]); // theo dõi mảng flipped để xử lý logic khi có 2 thẻ được lật

  const generateCards = () => {
    // hàm để tạo các thẻ bài mới cho vòng chơi hiện tại
    const pairCount = CARD_PAIRS[round - 1]; // lấy số cặp thẻ cho vòng chơi hiện tại
    const shuffled = allImages.sort(() => 0.5 - Math.random()); // trộn ngẫu nhiên mảng allImages để lấy các hình ảnh
    const selected = shuffled.slice(0, pairCount); // lấy số hình ảnh tương ứng với số cặp thẻ cần tạo
    const cardSet = [...selected, ...selected] // tạo cặp thẻ bằng cách nhân đôi mảng selected
      .map((img) => ({ image: img, id: Math.random() })) // tạo đối tượng thẻ với hình ảnh và id ngẫu nhiên
      .sort(() => 0.5 - Math.random()); // trộn ngẫu nhiên mảng thẻ để tạo độ ngẫu nhiên cho vị trí các thẻ
    setCards(cardSet); // cập nhật mảng cards với các thẻ đã tạo
    setFlipped([]); // reset mảng flipped để không có thẻ nào được lật
    setMatched([]); // reset mảng matched để không có thẻ nào đã ghép đôi
    // setWrongCount(0);
    setName(Object.keys(characterImages)[Math.floor(Math.random() * 8)]); // chọn ngẫu nhiên một tên nhân vật từ mảng characterImages
  };

  const handleStartRound = () => {
    // hàm để bắt đầu vòng chơi mới
    const previewTime = PREVIEW_TIMES[round - 1] || 3000; // fallback nếu vượt quá số vòng
    setIsReady(false); // đặt trạng thái không sẵn sàng để bắt đầu vòng chơi mới

    // Đợi 100ms để đảm bảo cards render xong
    setTimeout(() => {
      const allIndexes = cards.map((_, i) => i); // lấy tất cả chỉ số của các thẻ
      setShakingCardIndexes(allIndexes); // đặt mảng shakingCardIndexes để preview toàn bộ các thẻ
      playSound("/sheepgame/sounds/shaken-bush.mp3", 1);

      setTimeout(() => {
        // sau 1 giây, lật tất cả các thẻ để người chơi có thể nhìn thấy
        setFlipped(allIndexes); // đặt mảng flipped với tất cả các chỉ số của thẻ
        setPreviewing(true); // đặt trạng thái previewing để hiển thị các thẻ trong thời gian previewTime

        setTimeout(() => {
          // sau thời gian previewTime, lật lại các thẻ
          setFlipped([]); // reset mảng flipped để không có thẻ nào được lật
          setPreviewing(false); // đặt trạng thái previewing về false
          setShakingCardIndexes([]); // reset mảng shakingCardIndexes để không có thẻ nào đang rung
        }, previewTime); // sau thời gian previewTime, reset các thẻ
      }, 1000);
    }, 500); // đảm bảo cards đã render mới run
  };

  const handleCardClick = (index) => {
    // hàm để xử lý khi người chơi click vào một thẻ
    if (
      isReady ||
      previewing ||
      flipped.length >= 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    ) {
      // nếu đang ở trạng thái sẵn sàng, đang preview, đã lật đủ 2 thẻ, hoặc thẻ đã được lật hoặc đã ghép đôi
      return; // không làm gì cả
    }
    setShakingCardIndex(index); // đặt thẻ đang rung để tạo hiệu ứng rung khi click
    playSound("/sheepgame/sounds/shaken-bush.mp3", 1);
    setFlipAttempts((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + 1,
    })); // tăng số lần lật của thẻ được click lên 1
    setTimeout(() => {
      // sau 1 giây, lật thẻ được click
      setFlipped((prev) => [...prev, index]); // thêm chỉ số của thẻ được click vào mảng flipped
      setShakingCardIndex(null); // reset thẻ đang rung để không còn hiệu ứng rung
      playSound("/sheepgame/sounds/sheep-baa.mp3", 1);
    }, 1000);
  };

  const resetRound = () => {
    setShowCharacter(false);
    setCards([]);
    setTimeout(() => {
      setShowCharacter(true);
    }, 600);
  };

  const submitGameSession = async (
    // hàm để gửi kết quả của phiên chơi game lên server
    //userId,
    startTime,
    endTime,
    gameType = "SheepMemoryMatch",
    maxRounds,
    correctFirstTry,
    correctSecondTry,
    totalWrongAnswers
  ) => {
    try {
      console.log("Submitting game session...");
      //console.log("User ID:", userId);
      console.log("Start Time:", startTime);
      console.log("End Time:", endTime);
      console.log("Game Type:", gameType);
      console.log("Max Rounds:", maxRounds);
      console.log("Correct First Try Count:", correctFirstTry);
      console.log("Correct Second Try Count:", correctSecondTry);
      console.log("Total Wrong Answers Count:", totalWrongAnswers);

      await api.post("/GameSession/create", {
        // gửi dữ liệu lên server
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

  return (
    // trả về giao diện của game
    <div style={styles.container}>
      {/* hình ảnh con cừu bên trái */}
      <img
        src="/sheepgame/images/sheep-left.png"
        alt="Sheep Left"
        style={styles.sheepLeft}
      />

      {/* Câu hỏi (hiệu ứng từ trái vào) */}
      <motion.div
        key={name + round + "-question"}
        initial={{ x: -500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -500, opacity: 0 }}
        transition={{ duration: 2.5 }}
        style={styles.question}
      >
        Let's help <strong>{name}</strong> match all the sheep!
      </motion.div>

      {/* Hướng dẫn (hiệu ứng từ dưới lên) */}
      <motion.div
        key="instruction"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.instruction}
      >
        Click on these bush to find pair of sheep. Match all sheep to complete
        each round.
      </motion.div>

      {/* khung game ở giữa, hình ảnh cánh đồng cỏ */}
      <div style={styles.field}>
        <AnimatePresence>
          {isReady && ( // nếu đang ở trạng thái sẵn sàng để bắt đầu vòng chơi
            <motion.div
              style={styles.readyOverlay}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 2.5 }}
            >
              <h2 style={styles.readyText}>Are you ready?</h2>
              <h4 style={{color: "green"}}>Let's preview</h4>
              <AnimatePresence>
                <motion.div
                  key="play-button"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* nút play gọi hàm handleStartRound để bắt đầu xem preview trước rồi bắt đầu chơi */}
                  <PlayButton onClick={handleStartRound} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* hiển thị nhân vật */}
          {showCharacter && (
            <Character
              key={name + round}
              name={name}
              src={characterImages[name] || ""}
              style={styles.characterImg}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* hiển thị các thẻ của mỗi vòng */}
          <motion.div
            key={round}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{
              ...styles.cardContainer,
              gridTemplateRows:
                cards.length > 10 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
              margin: cards.length > 10 ? "30vh auto" : "40vh auto",
            }}
          >
            {cards.map((card, index) => {
              const isFlipped =
                flipped.includes(index) || matched.includes(index); // kiểm tra xem thẻ đã được lật hay ghép đôi chưa
              return (
                <motion.div
                  key={`${round}-${card.id}-${
                    shakingCardIndex === index ? "shake" : ""
                  }`}
                  style={styles.cardWrapper}
                  onClick={() => handleCardClick(index)}
                  animate={
                    shakingCardIndexes.includes(index)
                      ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          transition: { duration: 0.5 },
                        }
                      : shakingCardIndex === index
                      ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          transition: { duration: 0.5 },
                        }
                      : {}
                  }
                >
                  <img
                    src={
                      isFlipped
                        ? `/sheepgame/images/sheep-${card.image}.png`
                        : "/sheepgame/images/card-back-bush.png"
                    }
                    alt="card"
                    style={{
                      ...styles.cardImg,
                      filter: justMatched.includes(index)
                        ? `drop-shadow(0 0 10px ${card.image})`
                        : "none",
                      transition: "filter 0.5s ease-in-out",
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <SoundToggleButton /> {/* nút bật/tắt âm thanh */}
      </div>

      {/* hiển thị bảng điểm bên phải */}
      <GameStats 
        startTime={startTime}
        round={round}
        maxRounds={MAX_ROUNDS}
        correctFirstTryCount={correctFirstTry}
        correctSecondTryCount={correctSecondTry}
        isMemoryMatch={true}
      />

      {/* nút để thoát trò chơi */}
      <button onClick={() => setShowConfirmModal(true)} style={styles.button}>
        ⬅ Exit
      </button>
      {/* hộp thoại xác nhận thoát hay không */}
      <ConfirmModal
        visible={showConfirmModal}
        message="Do you want to cancel this game session? Your progress will not be saved."
        onConfirm={() => navigate("/sheep-memory-intro")}
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
  cardContainer: {
    display: "grid",
    gridAutoFlow: "column", // đổ từ trái sang phải, theo cột
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
  },

  cardWrapper: {
    width: "100px",
    height: "100px",
    perspective: "1000px", // dùng nếu sau này muốn hiệu ứng lật 3D
    cursor: "pointer",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    transition: "transform 0.3s",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
    gap: "10px",
    justifyContent: "center",
    padding: "1rem",
  },
  card: {
    width: "80px",
    height: "80px",
    perspective: "1000px",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "10px",
    cursor: "pointer",
  },
  characterImg: {
    position: "absolute",
    top: "10vh",
    left: "5vw",
    width: "15vh",
    height: "auto",
    filter: "drop-shadow(0 8px 4px rgba(0, 0, 0, 0.3))",
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
    borderRadius: "50%",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "background-color 0.3s",
  },
  readyOverlay: {
    position: "absolute",
    top: "5%",
    left: "37%",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  readyText: {
    fontSize: "2rem",
    color: "green",
    marginBottom: "10px",
  },
};
