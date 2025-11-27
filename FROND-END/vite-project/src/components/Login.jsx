// src/components/Login.jsx (ACTUALIZADO CON NUEVOS ESTILOS)
import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Lógica de autenticación con el backend
    console.log('Datos de login:', formData);
    onLogin();
  };

  return (
    <div className="auth-container">
      {/* Decoraciones de fondo */}
      <div className="auth-decoration decoration-1">⛽</div>
      <div className="auth-decoration decoration-2">💰</div>
      <div className="auth-decoration decoration-3">📍</div>
      
      <div className="auth-header">
        <h1>GeoGas</h1>
        <p></p>
      </div>
      
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        
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
            />
          </div>
          
          <button type="submit" className="auth-button">
            Iniciar Sesión
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