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
                <Navigate to="/home" replace />
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
          <Route
            path="/sheep-color-intro"
            element={
              <PrivateRoute>
                <SheepColorIntro onLogout={() => setIsLoggedIn(false)} />
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
        </Routes>
      </MusicProvider>
    </Router>
  );
}

export default App;
