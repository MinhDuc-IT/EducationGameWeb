// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useState, useEffect } from "react";
import SheepCountingGame from "./pages/SheepCountingGame";
import { MusicProvider } from "./MusicContext";
import SheepIntro from "./pages/SheepIntro";
import PrivateRoute from "./PrivateRoot";
import SheepColorIntro from "./pages/SheepColorIntro";
import SheepColorCountingGame from "./pages/SheepColorCountingGame";
import Home from "./pages/Home";
import GameMap from "./pages/GameMap";
import SheepMemoryIntro from "./pages/SheepMemoryIntro";
import SheepMemoryMatchGame from "./pages/SheepMemoryMatchGame";
import RegisterPage from "./pages/RegisterPage";

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
              isLoggedIn ? (
                <Navigate to="/game-map" replace />
              ) : (
                <LoginPage onLogin={() => setIsLoggedIn(true)} />
              )
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home onLogout={() => setIsLoggedIn(false)} />
              </PrivateRoute>
            }
          />
          <Route
            path="/register"
            element={
                <RegisterPage />
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
                <SheepIntro />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheep-color-intro"
            element={
              <PrivateRoute>
                <SheepColorIntro />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheep-color"
            element={
              <PrivateRoute>
                <SheepColorCountingGame />
              </PrivateRoute>
            }
          />
          <Route
            path="/game-map"
            element={
              <PrivateRoute>
                <GameMap onLogout={() => setIsLoggedIn(false)} />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheep-memory-intro"
            element={
              <PrivateRoute>
                <SheepMemoryIntro />
              </PrivateRoute>
            }
          />
          <Route
            path="/sheep-memory"
            element={
              <PrivateRoute>
                <SheepMemoryMatchGame />
              </PrivateRoute>
            }
          />
        </Routes>
      </MusicProvider>
    </Router>
  );
}

export default App;
