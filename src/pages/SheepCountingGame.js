// SheepCountingGame.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SoundToggleButton from "../components/SoundToggleButton";
import Character from "../components/Character";
import Sheep from "../components/Sheep";
import Option from "../components/Option";

const names = ["Luna", "Max", "Olivia", "Leo", "Emma", "Noah", "Mia", "Ethan"];
const characterImages = {
  Luna: "/images/character-luna.png",
  Max: "/images/character-max.png",
  Olivia: "/images/character-olivia.png",
  Leo: "/images/character-leo.png",
  Emma: "/images/character-emma.png",
  Noah: "/images/character-noah.png",
  Mia: "/images/character-mia.png",
  Ethan: "/images/character-ethan.png",
};

const MAX_ROUNDS = 2;

function SheepCountingGame() {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [clickedSheep, setClickedSheep] = useState([]);
  const [sheepPositions, setSheepPositions] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedWrong, setSelectedWrong] = useState([]);
  const [message, setMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [shouldSpeakQuestion, setShouldSpeakQuestion] = useState(false);
  const [shouldSpeakIntro, setShouldSpeakIntro] = useState(false);
  const [hideCorrectAnswer, setHideCorrectAnswer] = useState(false);
  const [showCharacter, setShowCharacter] = useState(true);

  useEffect(() => {
    startNewRound();
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
        speak(`How many sheep does ${name} have?`, 1, 1.5);
      }, 3000);
      setShouldSpeakQuestion(false);
    }
  }, [shouldSpeakIntro, shouldSpeakQuestion, name]);

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

  const startNewRound = () => {
    if (round > MAX_ROUNDS) {
      speak("Great job!", 1.1, 1.6);
      setTimeout(() => {
        speak("You counted all the sheep! Do you want to play again?", 1.1, 1.6);
        navigate("/sheep-intro");
      }, 2000);
      return;
    }

    playSound("/sounds/footsteps.mp3", 1);
    playSound("/sounds/sheep-baa2.mp3", 1);

    const newCount = Math.floor(Math.random() * 10) + 1;
    const newName = names[Math.floor(Math.random() * names.length)];
    const wrongOptions = generateWrongOptions(newCount);
    const newPositions = generateNonOverlappingPositions(newCount, []);

    setName(newName);
    setCount(newCount);
    setClickedSheep([]);
    setSelectedWrong([]);
    setMessage("");
    setOptions(shuffleArray([newCount, ...wrongOptions]));
    setShowOptions(false);
    setHideCorrectAnswer(false);
    setSheepPositions(newPositions);
    setShowCharacter(true);

    if (!hasSpokenIntro) {
      setShouldSpeakIntro(true);
      setHasSpokenIntro(true);
    } else {
      setShouldSpeakQuestion(true);
    }
  };

  const generateWrongOptions = (correct) => {
    let wrongs = new Set();
    while (wrongs.size < 2) {
      const n = Math.floor(Math.random() * 10) + 1;
      if (n !== correct) wrongs.add(n);
    }
    return Array.from(wrongs);
  };

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const generateNonOverlappingPositions = (n) => {
    const positions = [];
    while (positions.length < n) {
      const pos = getRandomPosition();
      const isOverlapping = positions.some(
        (p) =>
          Math.abs(parseFloat(p.left) - parseFloat(pos.left)) < 12 &&
          Math.abs(parseFloat(p.top) - parseFloat(pos.top)) < 12
      );
      if (!isOverlapping) {
        positions.push(pos);
      }
    }
    return positions;
  };

  const getRandomPosition = () => {
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 30 + 60;
    return { left: `${x}%`, top: `${y}%` };
  };

  const handleSheepClick = (index) => {
    if (!clickedSheep.includes(index)) {
      playSound("/sounds/sheep-baa.mp3", 1);
      const newClicked = [...clickedSheep, index];
      setClickedSheep(newClicked);
      speak(newClicked.length.toString(), 1.3, 1.6);

      const newPositions = sheepPositions.map((pos, i) => {
        if (newClicked.includes(i)) return pos;
        let newPos;
        do {
          newPos = getRandomPosition();
        } while (
          newClicked.some((clickedIdx) => {
            const clickedPos = sheepPositions[clickedIdx];
            return (
              Math.abs(parseFloat(clickedPos.left) - parseFloat(newPos.left)) < 12 &&
              Math.abs(parseFloat(clickedPos.top) - parseFloat(newPos.top)) < 12
            );
          })
        );
        return newPos;
      });

      setSheepPositions(newPositions);

      if (newClicked.length === count) {
        setShowOptions(true);
      }
    }
  };

  const handleOptionClick = (number) => {
    if (!showOptions) return;
    if (number === count) {
      playSound("/sounds/success.mp3", 1);
      setTimeout(() => speak("Exactly!", 1, 1.8), 1000);
      setMessage("🎉 Exactly!");
      setSelectedWrong(options.filter((opt) => opt !== number));
      setTimeout(() => setHideCorrectAnswer(true), 1500);

      // setTimeout(() => setShowCharacter(false), 1800); // trigger exit
      // setTimeout(() => {
      //   setMessage("");
      //   setRound((prev) => prev + 1);
      //   startNewRound();
      // }, 2200);

      if (round >= MAX_ROUNDS) {
      setTimeout(() => {
        speak("Great job!", 1.1, 1.6);
        setTimeout(() => {
          speak("You counted all the sheep! Do you want to play again?", 1.1, 1.6);
          navigate("/sheep-intro");
        }, 2000);
      }, 1800);
    } else {
      // Animate thoát
      setTimeout(() => setShowCharacter(false), 1800);
      setTimeout(() => {
        setMessage("");
        setRound((prev) => prev + 1);
        startNewRound();
      }, 2200);
    }
    } else {
      playSound("/sounds/fail.mp3", 1);
      setTimeout(() => speak("Try again", 1.0, 1.2), 1000);
      setMessage("❌ Try again");
      setSelectedWrong([...selectedWrong, number]);
    }
  };

  const playSound = (src, volume = 1) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.error("Error playing audio:", err));
  };

  return (
    <div style={styles.container}>
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

      <div style={styles.field}>
        <AnimatePresence mode="wait">
          {showCharacter && (
            <Character
              key={name + round}
              name={name}
              src={characterImages[name] || ""}
              style={styles.characterImg}
            />
          )}
        </AnimatePresence>

        {sheepPositions.map((pos, i) => (
          <Sheep
            key={i}
            index={i}
            pos={pos}
            clicked={clickedSheep.includes(i)}
            onClick={() => handleSheepClick(i)}
          />
        ))}

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
              {options.map((num) => (
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

        <SoundToggleButton />
      </div>
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
};

export default SheepCountingGame;

