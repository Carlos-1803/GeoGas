// src/Pages/Welcome.jsx
import React from 'react';
import './Welcome.css';

const Welcome = ({ onGetStarted }) => {
  return (
    <div className="welcome-container">
      {/* Fondo con gradiente */}
      <div className="welcome-background"></div>
      
      {/* Contenido principal */}
      <div className="welcome-content">
        {/* Logo y título */}
        <div className="welcome-header">
          <div className="welcome-logo">
            <span className="logo-icon">⛽</span>
          </div>
          <h1 className="welcome-title">GeoGas </h1>
          <p className="welcome-subtitle">Tu compañero inteligente para encontrar combustible</p>
        </div>
        {/* Botón de acción */}
        <div className="welcome-actions">
          <button className="get-started-btn" onClick={onGetStarted}>
            Comenzar a Explorar
            <span className="btn-arrow">→</span>
          </button>
          
          <p className="welcome-note">
            Únete a miles de conductores que ahorran tiempo y dinero
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;