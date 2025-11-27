// src/App.jsx (ACTUALIZADO)
import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Welcome from './Pages/Welcome';
import Home from './Pages/Home';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('welcome');
  };

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  if (isLoggedIn) {
    return <Home onLogout={handleLogout} />;
  }

  // Vistas para usuarios no logueados
  switch (currentView) {
    case 'welcome':
      return <Welcome onGetStarted={handleGetStarted} />;
    case 'login':
      return <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
    case 'register':
      return <Register onRegister={handleLogin} onSwitchToLogin={switchToLogin} />;
    default:
      return <Welcome onGetStarted={handleGetStarted} />;
  }
}

export default App;