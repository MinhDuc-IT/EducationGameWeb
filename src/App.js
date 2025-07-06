// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { useState, useEffect } from 'react';
import SheepCountingGame from './pages/SheepCountingGame';
import { MusicProvider } from './MusicContext';
import SheepIntro from './pages/SheepIntro';
import PrivateRoute from './PrivateRoot';

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
            isLoggedIn ? <Navigate to="/sheep-intro" replace/> : <LoginPage onLogin={() => setIsLoggedIn(true)} />
          }
        />
        <Route
            path="/sheep"
            element={
              <PrivateRoute>
                <SheepCountingGame />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheep-intro"
            element={
              <PrivateRoute>
                <SheepIntro onLogout={() => setIsLoggedIn(false)} />
              </PrivateRoute>
            }
          />
      </Routes>
      </MusicProvider>
    </Router>
  );
}

export default App;
