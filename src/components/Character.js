import { motion } from "framer-motion";

function Character({ name, round, src, style }) {
  return (
    <motion.img
      key={name + round + "-character"}
      src={src}
      alt={name}
      initial={{ x: -150, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 1000, opacity: 0.5 }}
      transition={{ duration: 2.5 }}
      style={style}
    />
  );
}

export default Character;
