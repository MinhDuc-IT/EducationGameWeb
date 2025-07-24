// // component hiển thị các đáp án lựa chọn
// import { motion } from "framer-motion";

// function Option({ num, isCorrect, isWrong, hide, message, onClick }) {
//   const shouldHide = isWrong || (hide && isCorrect);

//   return (
//     <motion.div
//       initial={{ scale: 1, opacity: 1, y: 0 }}
//       animate={{
//         scale: isCorrect && message.includes("Exactly!") ? 1.5 : 1,
//         opacity: shouldHide ? 0 : 1,
//         y: isWrong ? -100 : 0,
//       }}
//       transition={{ duration: 1 }}
//       style={{
//         position: "relative",
//         width: "80px",
//         height: "100px",
//         cursor: "pointer",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         margin: "18vh 1vw",
//       }}
//       onClick={() => onClick(num)}
//     >
//       <img src="/sheepgame/images/cloud.png" alt="Cloud" style={{ width: "150%" }} />
//       <span
//         style={{
//           position: "absolute",
//           top: "50%",
//           left: "50%",
//           transform: "translate(-50%, -50%)",
//           color: "#79DBF5",
//           fontSize: "2rem",
//           fontWeight: "bold",
//           pointerEvents: "none",
//           textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
//         }}
//       >
//         {num}
//       </span>
//     </motion.div>
//   );
// }

// export default Option;







import { motion } from "framer-motion";
import { useEffect } from "react";

// Hàm kiểm tra nếu là số
function isNumber(value) {
  return !isNaN(value);
}

function Option({ num, isCorrect, isWrong, hide, message, onClick }) {
  const shouldHide = isWrong || (hide && isCorrect);

  // Nếu num là màu (string), tạo đường dẫn ảnh tương ứng
  const isNumNumber = isNumber(num);
  const imageSrc = !isNumNumber
    ? `/sheepgame/images/sheep-${num}.png` // ví dụ: sheep-red.png
    : "/sheepgame/images/cloud.png";

  useEffect(() => {
    console.log("num: ", num);
    console.log("isCorrect: ", isCorrect);
    console.log("isWrong: ", isWrong);
    console.log("hide: ", hide);

  })

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
      <img
        src={imageSrc}
        alt="Option"
        style={{ width: "150%" }}
      />

      {/* Hiển thị số nếu là số */}
      {isNumNumber && (
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
      )}
    </motion.div>
  );
}

export default Option;
