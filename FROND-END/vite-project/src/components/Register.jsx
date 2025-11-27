// src/components/Register.jsx (ACTUALIZADO CON NUEVOS ESTILOS)
import React, { useState } from 'react';
import './Auth.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    // TODO: Lógica de registro con el backend
    console.log('Datos de registro:', formData);
    onRegister();
  };

  return (
    <div className="auth-container">
      {/* Decoraciones de fondo */}
      <div className="auth-decoration decoration-1">🚗</div>
      <div className="auth-decoration decoration-2">⭐</div>
      <div className="auth-decoration decoration-3">🔑</div>
      
      <div className="auth-header">
        <h1>GeoGas</h1>

      </div>
      
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          
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
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
            />
          </div>
          
          <button type="submit" className="auth-button">
            Crear Cuenta
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <span className="auth-link" onClick={onSwitchToLogin}>Inicia Sesión</span></p>
        </div>
      </div>
    </div>
  );
};

export default Register;