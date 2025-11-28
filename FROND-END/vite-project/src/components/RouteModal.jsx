import React, { useState, useEffect } from 'react';
import './RouteModal.css';

function RouteModal({ isOpen, onClose, routeData, onNavigate }) {
  const [ubicacion, setUbicacion] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [gasolineras, setGasolineras] = useState([]);
  const [gasolineraSeleccionada, setGasolineraSeleccionada] = useState(null);
  const [isLoadingGasolineras, setIsLoadingGasolineras] = useState(false);
  const [error, setError] = useState('');
  const [isIniciandoNavegacion, setIsIniciandoNavegacion] = useState(false);

  // Configuración de API
  const API_BASE_URL = 'http://localhost:5287';
  const GASOLINERAS_ENDPOINT = '/api/Gasolineras';

  // Función para limpiar etiquetas XML del nombre
  const limpiarNombre = (nombre) => {
    if (!nombre || nombre === 'null' || nombre === 'undefined') {
      return 'Gasolinera Sin Nombre';
    }
    
    let nombreLimpio = nombre.replace(/<name>|<\/name>/gi, '');
    nombreLimpio = nombreLimpio.replace(/<[^>]*>/g, '');
    nombreLimpio = nombreLimpio.trim();
    
    return nombreLimpio || 'Gasolinera Sin Nombre';
  };

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setUbicacion('');
      setUserCoords(null);
      setGasolineras([]);
      setGasolineraSeleccionada(null);
      setError('');
      setIsIniciandoNavegacion(false);
    }
  }, [isOpen]);

  // Función para calcular distancia usando fórmula Haversine
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Función para obtener ubicación en tiempo real
  const obtenerUbicacion = () => {
    setIsGettingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('La geolocalización no es compatible con este navegador');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserCoords({ lat: latitude, lng: longitude });
        
        const ubicacionFormateada = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setUbicacion(ubicacionFormateada);
        setIsGettingLocation(false);
        
        await obtenerYProcesarGasolineras(latitude, longitude);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        let mensaje = 'Error al obtener la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje = 'Permiso de ubicación denegado. Permite el acceso a la ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            mensaje = 'Tiempo de espera agotado.';
            break;
        }
        
        setError(mensaje);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Función para obtener y procesar gasolineras (MANTENIENDO TU LÓGICA QUE FUNCIONA)
  const obtenerYProcesarGasolineras = async (userLat, userLng) => {
    setIsLoadingGasolineras(true);
    setError('');
    
    try {
      console.log('🔄 Haciendo fetch a:', `${API_BASE_URL}${GASOLINERAS_ENDPOINT}`);
      
      const response = await fetch(`${API_BASE_URL}${GASOLINERAS_ENDPOINT}`);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const todasLasGasolineras = await response.json();
      console.log('✅ Gasolineras recibidas:', todasLasGasolineras);
      console.log('✅ Total de gasolineras:', todasLasGasolineras.length);
      
      // Procesar nombres de todas las gasolineras
      const gasolinerasProcesadas = todasLasGasolineras.map((gasolinera, index) => {
        const nombreRaw = gasolinera.Nombre || gasolinera.name || gasolinera.nombre;
        const nombreLimpio = limpiarNombre(nombreRaw);
        
        // Calcular distancia para TODAS las gasolineras
        let distancia = null;
        if (gasolinera.x !== null && gasolinera.y !== null && 
            gasolinera.x !== undefined && gasolinera.y !== undefined) {
          distancia = calcularDistancia(userLat, userLng, gasolinera.y, gasolinera.x);
        }
        
        return {
          ...gasolinera,
          nombreLimpio: nombreLimpio,
          nombreFinal: nombreLimpio !== 'Gasolinera Sin Nombre' ? nombreLimpio : `Gasolinera ${index + 1}`,
          distancia: distancia,
          position: [gasolinera.y, gasolinera.x]
        };
      }).filter(gasolinera => gasolinera.distancia !== null); // Filtrar solo las con distancia válida
      
      console.log('🔍 Gasolineras procesadas con distancia:', gasolinerasProcesadas);
      
      if (gasolinerasProcesadas.length === 0) {
        setError('No se encontraron gasolineras con coordenadas válidas');
        setIsLoadingGasolineras(false);
        return;
      }

      // Ordenar por distancia (más cercanas primero)
      const gasolinerasOrdenadas = gasolinerasProcesadas.sort((a, b) => a.distancia - b.distancia);
      
      setGasolineras(gasolinerasOrdenadas);
      
      // Seleccionar automáticamente la más cercana
      if (gasolinerasOrdenadas.length > 0) {
        setGasolineraSeleccionada(gasolinerasOrdenadas[0]);
        console.log('🏆 Gasolinera más cercana seleccionada:', gasolinerasOrdenadas[0].nombreFinal);
      }
      
    } catch (error) {
      console.error('❌ Error obteniendo gasolineras:', error);
      setError(`Error al cargar las gasolineras: ${error.message}`);
    } finally {
      setIsLoadingGasolineras(false);
    }
  };

  // Función para seleccionar una gasolinera
  const seleccionarGasolinera = (gasolinera) => {
    setGasolineraSeleccionada(gasolinera);
    console.log('📍 Gasolinera seleccionada:', gasolinera.nombreFinal);
  };

  // Función para iniciar navegación a la gasolinera seleccionada
  const iniciarNavegacion = () => {
    if (!gasolineraSeleccionada) {
      setError('Por favor selecciona una gasolinera');
      return;
    }

    if (!userCoords) {
      setError('Necesitas obtener tu ubicación primero');
      return;
    }

    setIsIniciandoNavegacion(true);
    
    // Preparar datos para la navegación
    const gasolineraParaNavegacion = {
      id: gasolineraSeleccionada.place_id || gasolineraSeleccionada.cre_id,
      name: gasolineraSeleccionada.nombreFinal,
      position: gasolineraSeleccionada.position,
      distancia: gasolineraSeleccionada.distancia,
      precio: "Consultar en sitio",
      type: "Gasolinera"
    };

    // Llamar a la función del padre para iniciar navegación
    if (onNavigate) {
      onNavigate(gasolineraParaNavegacion);
    }

    // Cerrar el modal
    setTimeout(() => {
      onClose();
      setIsIniciandoNavegacion(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🧭 Seleccionar Gasolinera</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">⚠️ {error}</div>
          )}

          <div className="route-info">
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">📍 Tu Ubicación:</span>
                <div className="ubicacion-container">
                  {ubicacion ? (
                    <span className="data-value">{ubicacion}</span>
                  ) : (
                    <button 
                      className="btn-agregar-ubicacion"
                      onClick={obtenerUbicacion}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? '📍 Obteniendo ubicación...' : '📍 Obtener mi ubicación'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Lista de Gasolineras para Selección */}
            {ubicacion && gasolineras.length > 0 && (
              <div className="gasolineras-section">
                <h3 className="gasolineras-title">
                  ⛽ Gasolineras Disponibles ({gasolineras.length} encontradas)
                </h3>
                
                {isLoadingGasolineras ? (
                  <div className="loading-gasolineras">
                    <div className="loading-spinner">⛽</div>
                    <p>Calculando distancias...</p>
                  </div>
                ) : (
                  <div className="gasolineras-list">
                    {gasolineras.map((gasolinera, index) => (
                      <div 
                        key={gasolinera.place_id || index} 
                        className={`gasolinera-item ${gasolineraSeleccionada?.place_id === gasolinera.place_id ? 'selected' : ''}`}
                        onClick={() => seleccionarGasolinera(gasolinera)}
                      >
                        <div className="gasolinera-info">
                          <div className="gasolinera-header">
                            <h4 className="gasolinera-nombre">
                              {gasolinera.nombreFinal || gasolinera.nombreLimpio}
                              {index === 0 && <span className="mas-cercana-badge"> 🏆 Más cercana</span>}
                            </h4>
                            <span className="distancia-badge">
                              {gasolinera.distancia.toFixed(2)} km
                            </span>
                          </div>
                          <div className="gasolinera-details-small">
                            <p className="gasolinera-direccion">
                              <strong>CRE:</strong> {gasolinera.cre_id || 'No disponible'}
                            </p>
                            <p className="gasolinera-coordenadas">
                              <strong>Coordenadas:</strong> {gasolinera.y?.toFixed(4) || 'N/A'}, {gasolinera.x?.toFixed(4) || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="gasolinera-seleccion-indicator">
                          {gasolineraSeleccionada?.place_id === gasolinera.place_id && (
                            <div className="selected-indicator">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Gasolinera Seleccionada */}
            {gasolineraSeleccionada && (
              <div className="gasolinera-seleccionada-section">
                <h3 className="gasolinera-seleccionada-title">✅ Gasolinera Seleccionada</h3>
                <div className="gasolinera-seleccionada-card">
                  <div className="gasolinera-header">
                    <h4 className="gasolinera-nombre">
                      {gasolineraSeleccionada.nombreFinal || gasolineraSeleccionada.nombreLimpio}
                    </h4>
                    <span className="distancia-badge">
                      {gasolineraSeleccionada.distancia.toFixed(2)} km
                    </span>
                  </div>
                  
                  <div className="gasolinera-details">
                    <div className="gasolinera-detail">
                      <span className="detail-label">Nombre:</span>
                      <span className="detail-value nombre-gasolinera">
                        {gasolineraSeleccionada.nombreFinal || gasolineraSeleccionada.nombreLimpio}
                      </span>
                    </div>
                    
                    <div className="gasolinera-detail">
                      <span className="detail-label">CRE ID:</span>
                      <span className="detail-value">{gasolineraSeleccionada.cre_id || 'No disponible'}</span>
                    </div>
                    
                    <div className="gasolinera-detail">
                      <span className="detail-label">Coordenadas:</span>
                      <span className="detail-value">
                        {gasolineraSeleccionada.y?.toFixed(6) || 'N/A'}, {gasolineraSeleccionada.x?.toFixed(6) || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="gasolinera-detail">
                      <span className="detail-label">Distancia:</span>
                      <span className="detail-value">
                        {gasolineraSeleccionada.distancia.toFixed(2)} kilómetros
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="additional-info">
              <p>Selecciona una gasolinera de la lista y presiona "Ver Ruta en Mapa" para generar la navegación.</p>
              {!ubicacion && (
                <p style={{marginTop: '8px', fontSize: '11px', color: '#86efac'}}>
                  💡 Presiona "Obtener mi ubicación" para encontrar gasolineras cercanas.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-action-btn secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="modal-action-btn primary"
            onClick={iniciarNavegacion}
            disabled={!gasolineraSeleccionada || isIniciandoNavegacion}
          >
            {isIniciandoNavegacion ? '🔄 Iniciando...' : '🗺️ Ver Ruta en Mapa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteModal;