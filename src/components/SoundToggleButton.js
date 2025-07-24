// component bật/tắt nhạc nền
import { useMusic } from "../MusicContext";
import { FiVolume2, FiVolumeX } from "react-icons/fi";

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
        backgroundImage: "url('/sheepgame/images/sun.png')",
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
