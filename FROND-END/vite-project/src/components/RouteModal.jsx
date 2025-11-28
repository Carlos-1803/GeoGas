import React from 'react';
import './RouteModal.css';

function RouteModal({ isOpen, onClose, routeData }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header">
          <h2 className="modal-title">🧭 Información de Ruta</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body del Modal */}
        <div className="modal-body">
          {routeData ? (
            <div className="route-info">
              <div className="data-grid">
                <div className="data-item">
                  <span className="data-label">📍 Ubicación:</span>
                  <span className="data-value">{routeData.ubicacion || "No disponible"}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">🎯 Destino:</span>
                  <span className="data-value">{routeData.destino || "No disponible"}</span>
                </div>
                <div className="data-item">
                  <span className="data-label">📏 Distancia:</span>
                  <span className="data-value">{routeData.distancia ? `${routeData.distancia} km` : "0 km"}</span>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="additional-info">
                <h3>Información Adicional</h3>
                <p>Esta ruta ha sido calculada considerando el tráfico actual y las estaciones de servicio disponibles en tu trayectoria.</p>
              </div>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner">⛽</div>
              <p>Cargando datos de ruta...</p>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="modal-footer">
          <button className="modal-action-btn secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="modal-action-btn primary">
            Iniciar Navegación
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteModal;