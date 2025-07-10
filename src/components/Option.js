// component hiển thị các đáp án lựa chọn
import { motion } from "framer-motion";

function Option({ num, isCorrect, isWrong, hide, message, onClick }) {
  const shouldHide = isWrong || (hide && isCorrect);

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1, y: 0 }}
      animate={{
        scale: isCorrect && message.includes("Exactly!") ? 1.5 : 1,
        opacity: shouldHide ? 0 : 1,
        y: isWrong ? -100 : 0,
      }}
      transition={{ duration: 1 }}
      style={{
        position: "relative",
        width: "80px",
        height: "100px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "18vh 1vw",
      }}
      onClick={() => onClick(num)}
    >
      <img src="/images/cloud.png" alt="Cloud" style={{ width: "150%" }} />
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#79DBF5",
          fontSize: "2rem",
          fontWeight: "bold",
          pointerEvents: "none",
          textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
        }}
      >
        {num}
      </span>
    </motion.div>
  );
}

export default Option;
