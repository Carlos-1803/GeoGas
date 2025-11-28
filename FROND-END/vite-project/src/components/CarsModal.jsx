import React, { useState, useEffect } from "react";
import "./CarsModal.css";

const CarsModal = ({ isOpen, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [carFound, setCarFound] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [cochePrincipal, setCochePrincipal] = useState(null);

  // Configuración de API
  const API_BASE_URL = 'http://localhost:5287';
  const COCHES_ENDPOINT = '/api/Coche';

  // Cargar coches del usuario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCochesUsuario();
    }
  }, [isOpen]);

  // Función para cargar los coches del usuario desde el backend
  const cargarCochesUsuario = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${COCHES_ENDPOINT}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los coches');
      }
      
      const coches = await response.json();
      setUserCars(coches);
      
      // Establecer el primer coche como principal (puedes modificar esta lógica)
      if (coches.length > 0) {
        setCochePrincipal(coches[0]);
      }
      
    } catch (error) {
      console.error('Error cargando coches:', error);
      setError('Error al cargar los coches del usuario');
    }
  };

  // Función para buscar coche en la base de datos
  const handleSearchCar = async (e) => {
    e.preventDefault();
    setError("");
    setCarFound(null);
    setLoading(true);

    try {
      // Buscar en la base de datos usando el endpoint de búsqueda
      const response = await fetch(`${API_BASE_URL}${COCHES_ENDPOINT}/buscar?termino=${encodeURIComponent(marca + ' ' + modelo)}`);
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const resultados = await response.json();
      
      if (resultados && resultados.length > 0) {
        // Tomar el primer resultado que coincida
        const foundCar = resultados[0];
        setCarFound({
          ...foundCar,
          rendimiento: "15.2 km/L", // Estos datos podrían venir del backend
          tipoCombustible: "Gasolina"
        });
        setError("");
      } else {
        setError("Lo sentimos, tu coche no está registrado en nuestra base de datos.");
        setCarFound(null);
      }
      
    } catch (error) {
      console.error('Error buscando coche:', error);
      setError("Error al buscar el coche en la base de datos");
      setCarFound(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar coche a la base de datos
  const handleAddCar = async () => {
    if (!carFound) return;

    setLoading(true);
    try {
      const nuevoCoche = {
        marca: carFound.marca,
        modelo: carFound.modelo,
        // Puedes agregar más campos aquí según tu modelo Coche
        año: new Date().getFullYear(), // Ejemplo, ajusta según necesites
        rendimiento: carFound.rendimiento,
        tipoCombustible: carFound.tipoCombustible
      };

      const response = await fetch(`${API_BASE_URL}${COCHES_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoCoche)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar el coche');
      }

      const cocheGuardado = await response.json();
      
      // Actualizar la lista de coches
      await cargarCochesUsuario();
      
      // Mostrar mensaje de éxito
      alert(`Coche ${cocheGuardado.marca} ${cocheGuardado.modelo} agregado exitosamente!`);
      
      // Resetear formulario
      resetForm();
      
    } catch (error) {
      console.error('Error agregando coche:', error);
      setError(`Error al agregar el coche: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para establecer coche como principal
  const handleSetPrincipal = async (coche) => {
    try {
      setCochePrincipal(coche);
      // Aquí podrías hacer una llamada al backend para marcar como principal
      // si tu modelo lo soporta
      alert(`${coche.marca} ${coche.modelo} establecido como coche principal`);
    } catch (error) {
      console.error('Error estableciendo coche principal:', error);
      setError('Error al establecer coche principal');
    }
  };

  // Función para eliminar coche
  const handleDeleteCar = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este coche?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${COCHES_ENDPOINT}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el coche');
      }

      // Actualizar la lista de coches
      await cargarCochesUsuario();
      
      // Si el coche eliminado era el principal, actualizar
      if (cochePrincipal && cochePrincipal.id === id) {
        setCochePrincipal(userCars[1] || null);
      }
      
      alert('Coche eliminado exitosamente');
      
    } catch (error) {
      console.error('Error eliminando coche:', error);
      setError('Error al eliminar el coche');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setMarca("");
    setModelo("");
    setError("");
    setCarFound(null);
    setLoading(false);
  };

  if (!isOpen) return null;

  // Renderizar formulario de agregar coche
  if (showForm) {
    return (
      <div className="modal-overlay" onClick={resetForm}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header del modal */}
          <div className="modal-header">
            <h2 className="modal-title">
              <span>🚗</span>
              Agregar Nuevo Coche
            </h2>
            <button className="modal-close-btn" onClick={resetForm}>
              ✕
            </button>
          </div>

          {/* Formulario */}
          <div className="modal-body">
            <form onSubmit={handleSearchCar} className="car-form">
              <div className="form-group">
                <label className="form-label">Marca del coche</label>
                <input
                  type="text"
                  className="form-input"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ej: Toyota, Nissan, Honda..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modelo del coche</label>
                <input
                  type="text"
                  className="form-input"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ej: Corolla, Versa, Civic..."
                  required
                />
              </div>

              <button 
                type="submit" 
                className="modal-action-btn primary search-btn"
                disabled={loading || !marca || !modelo}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Buscar en Base de Datos
                  </>
                )}
              </button>
            </form>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Resultado de búsqueda exitosa */}
            {carFound && (
              <div className="car-found-card">
                <div className="car-found-header">
                  <span className="car-found-icon">✅</span>
                  <h3>Coche Encontrado</h3>
                </div>
                <div className="car-found-details">
                  <div className="car-detail">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{carFound.marca}</span>
                  </div>
                  <div className="car-detail">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{carFound.modelo}</span>
                  </div>
                  <div className="car-detail">
                    <span className="detail-label">Rendimiento:</span>
                    <span className="detail-value highlight">{carFound.rendimiento}</span>
                  </div>
                  <div className="car-detail">
                    <span className="detail-label">Combustible:</span>
                    <span className="detail-value">{carFound.tipoCombustible}</span>
                  </div>
                </div>
                <button 
                  className="modal-action-btn primary add-btn"
                  onClick={handleAddCar}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      Agregar a Mis Coches
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Sugerencias */}
            <div className="additional-info">
              <h3>💡 Sugerencias</h3>
              <p>
                Asegúrate de escribir la marca y modelo exactos. 
                Ejemplo: "Toyota Corolla" o "Nissan Versa"
              </p>
            </div>
          </div>

          {/* Footer del modal */}
          <div className="modal-footer">
            <button 
              className="modal-action-btn secondary"
              onClick={resetForm}
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar vista principal de coches
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">
            <span>🚗</span>
            Mis Coches
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
          {/* Mensaje de error global */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Tarjeta de coche principal */}
          {cochePrincipal && (
            <div className="data-grid">
              <div className="data-item principal-car">
                <div className="data-label">
                  <span>⭐</span>
                  Coche Principal
                </div>
                <div className="data-value">
                  <strong>{cochePrincipal.marca} {cochePrincipal.modelo}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Lista de todos los coches */}
          <div className="data-grid">
            <h3 style={{color: '#bbf7d0', fontSize: '16px', margin: '0 0 12px 0'}}>
              Todos mis coches ({userCars.length})
            </h3>
            
            {userCars.length === 0 ? (
              <div className="no-cars-message">
                <span>🚗</span>
                <p>No tienes coches registrados</p>
                <button 
                  className="modal-action-btn primary"
                  onClick={() => setShowForm(true)}
                >
                  Agregar tu primer coche
                </button>
              </div>
            ) : (
              userCars.map((car) => (
                <div key={car.id} className="data-item car-item">
                  <div className="data-label">
                    <span>🚗</span>
                    {car.marca} {car.modelo}
                  </div>
                  <div className="data-value" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                    <span style={{fontSize: '12px', color: '#a7f3d0'}}>
                      {car.tipoCombustible || "Gasolina"}
                    </span>
                    <span style={{fontSize: '12px', color: '#f9fafb'}}>
                      {car.rendimiento || "15.2 km/L"}
                    </span>
                    <div className="car-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => handleSetPrincipal(car)}
                      >
                        Principal
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleDeleteCar(car.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Información adicional */}
          <div className="additional-info">
            <h3>💡 Información</h3>
            <p>
              El rendimiento de tu coche principal se utiliza para calcular 
              la autonomía y el consumo estimado en tus rutas.
            </p>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="modal-footer">
          <button 
            className="modal-action-btn secondary"
            onClick={() => setShowForm(true)}
          >
            Agregar Nuevo Coche
          </button>
          {userCars.length > 0 && (
            <button className="modal-action-btn primary">
              Gestionar Coches
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarsModal;