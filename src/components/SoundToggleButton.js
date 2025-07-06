// // src/components/SoundToggleButton.jsx
// import { useMusic } from "../MusicContext";
// import { FiVolume2, FiVolumeX } from "react-icons/fi";
// import { MdWbSunny } from "react-icons/md";

// function SoundToggleButton() {
//   const { isMuted, toggleMute } = useMusic();

//   return (
//     <button
//       onClick={toggleMute}
//       style={{
//         position: "absolute",
//         top: "3vh",
//         right: "2vw",
//         width: 50,
//         height: 50,
//         borderRadius: "50%",
//         backgroundColor: isMuted ? "#DC560D" : "#4caf50",
//         border: "none",
//         cursor: "pointer",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//         zIndex: 1000,
//         color: "#fff",
//         fontSize: "24px",
//         transition: "background-color 0.3s",
//       }}
//     >
//       {isMuted ? <FiVolumeX /> : <FiVolume2 />}
//     </button>
//   );
// }

// export default SoundToggleButton;









import { scale, transform } from "framer-motion";
import { useMusic } from "../MusicContext";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { motion } from "framer-motion";

function SoundToggleButton() {
  const { isMuted, toggleMute } = useMusic();

  return (
    <div
      style={{
        position: "absolute",
        top: "3vh",
        right: "2vw",
        width: "7vw",
        height: "7vw",
        backgroundImage: "url('/images/sun.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={toggleMute}
    >
      {isMuted ? (
        <FiVolumeX style={{ color: "#f97316", fontSize: "24px" }} />
      ) : (
        <FiVolume2 style={{ color: "#f97316", fontSize: "24px" }} />
      )}
    </div>
  );
}

export default SoundToggleButton;
