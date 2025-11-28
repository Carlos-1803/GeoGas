import React from 'react';
import "./EstacionModal.css";

function EstacionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="estacion-modal-overlay" onClick={onClose}>
      <div className="estacion-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="estacion-modal-header">
          <h2>⛽ Estaciones de Gasolina</h2>
          <button className="estacion-close-button" onClick={onClose}>×</button>
        </div>

        {/* Contenido del modal */}
        <div className="estacion-modal-body">
          <div className="estacion-stations-filters">
            <h3>Filtrar por:</h3>
            <div className="estacion-filter-options">
              <label className="estacion-filter-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Precio más bajo</span>
              </label>
              <label className="estacion-filter-checkbox">
                <input type="checkbox" />
                <span>Abiertas 24h</span>
              </label>
              <label className="estacion-filter-checkbox">
                <input type="checkbox" />
                <span>Estaciones cercanas</span>
              </label>
            </div>
          </div>

          <div className="estacion-stations-list">
            <h3>Estaciones disponibles</h3>
            <div className="estacion-station-item">
              <div className="estacion-station-info">
                <h4>Gasolinera Premium Center</h4>
                <p>📍 Av. Principal #123 - 2.3 km</p>
                <p>⏰ Abierto · 24 horas</p>
              </div>
              <div className="estacion-station-prices">
                <span className="estacion-price">$22.50 Magna</span>
                <span className="estacion-price">$24.10 Premium</span>
              </div>
            </div>

            <div className="estacion-station-item">
              <div className="estacion-station-info">
                <h4>Gasolinera Express</h4>
                <p>📍 Calle Secundaria #456 - 3.1 km</p>
                <p>⏰ Abierto · Hasta 22:00</p>
              </div>
              <div className="estacion-station-prices">
                <span className="estacion-price">$22.30 Magna</span>
                <span className="estacion-price">$24.00 Premium</span>
              </div>
            </div>

            <div className="estacion-station-item">
              <div className="estacion-station-info">
                <h4>Gasolinera Eco Fuel</h4>
                <p>📍 Blvd. Norte #789 - 4.5 km</p>
                <p>⏰ Abierto · 24 horas</p>
              </div>
              <div className="estacion-station-prices">
                <span className="estacion-price">$22.80 Magna</span>
                <span className="estacion-price">$24.30 Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="estacion-modal-footer">
          <button className="estacion-btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="estacion-btn-primary">
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstacionModal;