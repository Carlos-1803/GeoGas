import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5287'; 
  const LOGIN_ENDPOINT = '/api/auth/login';

  const handleChange = (e) => {
    setError('');
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = {
      Correo: formData.email,
      Contraseña: formData.password
    };

    try {
      console.log('Enviando solicitud de login a:', API_BASE_URL + LOGIN_ENDPOINT);
      
      const response = await fetch(API_BASE_URL + LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Respuesta recibida, status:', response.status);

      let data = {};
      try {
        data = await response.json();
        console.log('Datos recibidos:', data);
      } catch (jsonError) {
        console.error('Error parseando JSON:', jsonError);
        if (!response.ok) {
          setError(`Error del servidor (${response.status}). No se pudo procesar la respuesta.`);
          return;
        }
      }

      if (response.ok) {
        // ✅ CORRECCIÓN: Verificar tanto 'token' como 'Token'
        const token = data.token || data.Token;
        
        if (token) {
          // ✅ GUARDAR TOKEN EN LOCALSTORAGE
          localStorage.setItem('userToken', token);
          console.log('✅ Token guardado en localStorage:', token);
          
          // Guardar información del usuario
          if (data.user || data.User) {
            const userData = data.user || data.User;
            localStorage.setItem('userData', JSON.stringify(userData));
            console.log('✅ Datos de usuario guardados:', userData);
          }
          
          // Llamar a la función de éxito
          onLogin();
        } else {
          setError('Error: No se recibió token del servidor.');
          console.log('Datos completos recibidos:', data);
        }

      } else {
        let errorMessage = `Error (${response.status}) al iniciar sesión.`;
        
        if (response.status === 401) {
          errorMessage = data.Message || 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (response.status === 400 && data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          errorMessage = `Error de validación: ${data.errors[firstErrorKey][0]}`;
        } else if (data.Message) {
          errorMessage = data.Message;
        }
        
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Error de red/servidor:', err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-decoration decoration-1">⛽</div>
      <div className="auth-decoration decoration-2">💰</div>
      <div className="auth-decoration decoration-3">📍</div>
      
      <div className="auth-header">
        <h1>GeoGas</h1>
        <p>Inicia sesión en tu cuenta</p>
      </div>
      
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        
        {error && (
          <div className="validation-message error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿No tienes una cuenta? <span className="auth-link" onClick={onSwitchToRegister}>Regístrate aquí</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;