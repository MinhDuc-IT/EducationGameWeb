// src/components/PlayButton.jsx
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

function PlayButton({onClick}) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Sau này sẽ điều hướng tới game page
    alert('Coming soon!');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button className="play-button" onClick={onClick}>
        <FaPlay className="play-icon" />
      </button>

      <style>{`
        .play-button {
          background: none;
          border: none;
          cursor: pointer;
        }

        .play-icon {
          font-size: 60px;
          color:rgb(69, 201, 75);
          transition: transform 0.2s ease;
          filter: drop-shadow(0 8px 4px rgba(0, 0, 0, 0.3));
        }

        .play-icon:hover {
          transform: scale(1.2);
          color:rgb(73, 217, 80);
          filter: drop-shadow(0 8px 4px rgba(0, 0, 0, 0.3));
        }
      `}</style>
    </div>
  );
}

export default PlayButton;
