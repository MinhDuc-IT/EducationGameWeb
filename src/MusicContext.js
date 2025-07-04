// // src/context/MusicContext.js
// import { createContext, useContext, useRef, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

// const MusicContext = createContext();

// export const useMusic = () => useContext(MusicContext);

// export function MusicProvider({ children }) {
//   const audioRef = useRef(null);
//   const location = useLocation();

//   // Tự phát/tắt theo route
//   useEffect(() => {
//     const audio = audioRef.current;

//     if (!audio) return;

//     const shouldPlay =
//       location.pathname === '/game-intro' ||
//       location.pathname.startsWith('/sheep') ||
//       location.pathname === '/birthday-game';

//     if (shouldPlay) {
//       audio.volume = 0.2;
//       audio.loop = true;

//       if (audio.paused) {
//         audio.play().catch(() => {});
//       }
//     } else {
//       audio.pause();
//       audio.currentTime = 0;
//     }
//   }, [location.pathname]);

//   return (
//     <MusicContext.Provider value={{}}>
//       <audio ref={audioRef} src="/sounds/background-music.mp3" />
//       {children}
//     </MusicContext.Provider>
//   );
// }







// src/context/MusicContext.js
import { createContext, useContext, useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay =
      location.pathname === '/game-intro' ||
      location.pathname.startsWith('/sheep') ||
      location.pathname === '/birthday-game';

    if (shouldPlay) {
      audio.loop = true;
      audio.volume = isMuted ? 0 : 0.2;
      if (audio.paused) audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [location.pathname, isMuted]);

  const toggleMute = () => {
    const audio = audioRef.current;
    setIsMuted((prev) => {
      if (audio) {
        audio.volume = prev ? 0.2 : 0;
      }
      return !prev;
    });
  };

  return (
    <MusicContext.Provider value={{ isMuted, toggleMute }}>
      <audio ref={audioRef} src="/sounds/background-music.mp3" />
      {children}
    </MusicContext.Provider>
  );
}
