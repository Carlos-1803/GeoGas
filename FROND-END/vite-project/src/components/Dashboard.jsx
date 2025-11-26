// src/components/Dashboard.jsx (o App.jsx)

import React, { useState } from 'react';

// Importa los componentes de mapa y botones (los crearemos después)
import LeafletMap from './LeafletMap'; 
import BottomNav from './BottomNav';

function Dashboard() {
  // 1. Estado para almacenar el nombre del usuario
  const [userName, setUserName] = useState('Carlos'); // Usaremos 'Carlos' como default
  const [isModalOpen, setIsModalOpen] = useState(false); // Para la ventana emergente

  // Función para manejar la apertura/cierre de la ventana
  const openModal = () => setIsModalOpen(true);
  
  return (
    <div className="dashboard-container">
      {/* 2. Barra Superior (Header) */}
      <header className="header-bar">
        <div className="user-info">
          {/*  (Simulando la foto) */}
          <div className="text-info">
            <h1>Hola, {userName}</h1> 
            <p>Buen día para conducir</p>
          </div>
        </div>
        <div className="header-icons">
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">⚙️</button>
        </div>
      </header>

      {/* 3. Área del Mapa */}
      <main className="map-area">
        {/* Aquí irá el componente de Leaflet */}
        <LeafletMap />
      </main>

      {/* 4. Barra de Navegación Inferior (Botones) */}
      <footer className="footer-nav">
        {/* Usamos el componente BottomNav para los botones */}
        <BottomNav onButtonClick={openModal} />
      </footer>

      // Dentro de la función Dashboard(), después de <footer className="footer-nav">...</footer>

// ...
{/* 5. Ventana Emergente (Modal) */}
{isModalOpen && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>Acción Seleccionada</h2>
            <p>Aquí se mostraría la información o formulario relacionado con el botón que se presionó (ej. Mi Carro).</p>
            <button onClick={() => setIsModalOpen(false)}>Cerrar</button>
        </div>
    </div>
)}

    </div>
  );
}

export default Dashboard;