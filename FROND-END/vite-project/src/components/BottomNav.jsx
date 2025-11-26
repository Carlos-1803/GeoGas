// src/components/BottomNav.jsx

import React from 'react';
// Asumimos que `onButtonClick` es una prop que recibe este componente

const navItems = [
  { icon: '🚗', label: 'Mi Carro' },
  { icon: '📋', label: 'Lista de Presión' },
  { icon: '🛣️', label: 'Nueva Ruta' },
  { icon: '📊', label: 'Rendimiento' },
];

function BottomNav({ onButtonClick }) {
  return (
    <div className="bottom-nav-container">
      {navItems.map((item) => (
        <button 
          key={item.label} 
          className="nav-button" 
          onClick={onButtonClick} // Todos los botones abren la misma ventana emergente de ejemplo
        >
          <div className="nav-icon">{item.icon}</div>
          <p>{item.label}</p>
        </button>
      ))}
    </div>
  );
}

export default BottomNav;