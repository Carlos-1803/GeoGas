import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Home from './Pages/Home';
import './components/Auth.css';

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay token válido al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('userToken');
      
      console.log('🔍 Verificando token en localStorage:', token);
      
      if (!token) {
        console.log('❌ No hay token en localStorage');
        setIsLoading(false);
        return;
      }

      try {
        // Intentar validar el token con el backend
        console.log('🔄 Validando token con el backend...');
        const response = await fetch('http://localhost:5287/api/auth/validate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Respuesta de validación:', response.status);

        if (response.ok) {
          console.log('✅ Token válido - Usuario autenticado');
          setIsLoggedIn(true);
        } else {
          console.log('❌ Token inválido - Limpiando localStorage');
          // Token inválido, limpiar localStorage
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('🚨 Error validando token:', error);
        // En caso de error, asumimos que no está logueado
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleRegisterSuccess = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = () => {
    console.log('✅ Login exitoso - Redirigiendo a Home');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    setIsLoggedIn(false);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setCurrentView('login');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  // Mostrar loading mientras se verifica el token
  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="loading-spinner">⛽</div>
          <h2>GeoGas</h2>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está logueado, mostrar Home
  if (isLoggedIn) {
    return (
      <Home onLogout={handleLogout} />
    );
  }

  // Renderizar el componente según la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login 
            onLogin={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
          />
        );
      case 'register':
      default:
        return (
          <Register 
            onRegister={handleRegisterSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
    }
  };

  return renderCurrentView();
};

export default App;