// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { useState, useEffect } from 'react';
import SheepCountingGame from './pages/SheepCountingGame';
import { MusicProvider } from './MusicContext';
import SheepIntro from './pages/SheepIntro';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <MusicProvider>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/sheep-intro" /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />
          }
        />
        <Route path="/sheep" element={<SheepCountingGame />} />
        <Route path="/sheep-intro" element={<SheepIntro />} />
      </Routes>
      </MusicProvider>
    </Router>
  );
}

export default App;
