import { motion } from "framer-motion";

function Sheep({ index, pos, clicked, onClick }) {
  return (
    <motion.img
      src="/images/sheep.png"
      alt="Sheep"
      initial={false}
      animate={{
        left: pos.left,
        top: pos.top,
        y: [0, -12, 0, -8, 0, -6, 0],
      }}
      transition={{
        duration: 2.0,
        ease: "easeInOut",
        times: [0, 0.2, 0.4, 0.6, 0.75, 0.9, 1],
      }}
      style={{
        position: "absolute",
        width: "10vh",
        height: "auto",
        filter: "drop-shadow(0 6px 4px rgba(0, 0, 0, 0.35))",
        opacity: clicked ? 0.5 : 1,
        border: clicked ? "4px dashed red" : "none",
        cursor: "pointer",
      }}
      onClick={onClick}
    />
  );
}

export default Sheep;

