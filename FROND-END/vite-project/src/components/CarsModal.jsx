import React, { useState } from "react";
import "./CarsModal.css";

const CarsModal = ({ isOpen, onClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [carFound, setCarFound] = useState(null);

  if (!isOpen) return null;

  // Base de datos simulada de coches
  const carDatabase = [
    { id: 1, marca: "Toyota", modelo: "Corolla 2023", rendimiento: "15.2 km/L", tipoCombustible: "Gasolina" },
    { id: 2, marca: "Nissan", modelo: "Versa 2024", rendimiento: "14.8 km/L", tipoCombustible: "Gasolina" },
    { id: 3, marca: "Mazda", modelo: "CX-5 2023", rendimiento: "12.5 km/L", tipoCombustible: "Gasolina Premium" },
    { id: 4, marca: "Honda", modelo: "Civic 2023", rendimiento: "16.1 km/L", tipoCombustible: "Gasolina" },
    { id: 5, marca: "Volkswagen", modelo: "Jetta 2024", rendimiento: "13.9 km/L", tipoCombustible: "Gasolina" },
    { id: 6, marca: "Hyundai", modelo: "Tucson 2023", rendimiento: "11.8 km/L", tipoCombustible: "Gasolina" },
    { id: 7, marca: "Kia", modelo: "Rio 2024", rendimiento: "15.5 km/L", tipoCombustible: "Gasolina" },
    { id: 8, marca: "Ford", modelo: "Focus 2023", rendimiento: "14.2 km/L", tipoCombustible: "Gasolina" }
  ];

  // Datos de ejemplo para los coches del usuario
  const userCars = [
    {
      id: 1,
      marca: "Toyota",
      modelo: "Corolla 2023",
      imagen: "🚗",
      tipoCombustible: "Gasolina",
      rendimiento: "15.2 km/L",
      estado: "Activo"
    },
    {
      id: 2,
      marca: "Nissan",
      modelo: "Versa 2024",
      imagen: "🚙",
      tipoCombustible: "Gasolina",
      rendimiento: "14.8 km/L",
      estado: "Activo"
    }
  ];

  const handleSearchCar = async (e) => {
    e.preventDefault();
    setError("");
    setCarFound(null);
    setLoading(true);

    // Simular búsqueda en base de datos
    setTimeout(() => {
      const foundCar = carDatabase.find(car => 
        car.marca.toLowerCase() === marca.toLowerCase() && 
        car.modelo.toLowerCase() === modelo.toLowerCase()
      );

      if (foundCar) {
        setCarFound(foundCar);
        setError("");
      } else {
        setError("Lo sentimos, tu coche no está registrado en nuestra base de datos.");
        setCarFound(null);
      }
      setLoading(false);
    }, 1500);
  };

  const handleAddCar = () => {
    // Aquí iría la lógica para agregar el coche a la lista del usuario
    alert(`Coche ${carFound.marca} ${carFound.modelo} agregado exitosamente!`);
    setShowForm(false);
    setMarca("");
    setModelo("");
    setCarFound(null);
    setError("");
  };

  const resetForm = () => {
    setShowForm(false);
    setMarca("");
    setModelo("");
    setError("");
    setCarFound(null);
    setLoading(false);
  };

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
                  placeholder="Ej: Corolla 2023, Versa 2024..."
                  required
                />
              </div>

              <button 
                type="submit" 
                className="modal-action-btn primary search-btn"
                disabled={loading}
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
                >
                  <span>➕</span>
                  Agregar a Mis Coches
                </button>
              </div>
            )}

            {/* Sugerencias */}
            <div className="additional-info">
              <h3>💡 Sugerencias</h3>
              <p>
                Asegúrate de escribir la marca y modelo exactos. 
                Ejemplo: "Toyota Corolla 2023" o "Nissan Versa 2024"
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
          {/* Tarjeta de coche principal */}
          <div className="data-grid">
            <div className="data-item" style={{background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.4)'}}>
              <div className="data-label">
                <span>⭐</span>
                Coche Principal
              </div>
              <div className="data-value">
                Toyota Corolla 2023
              </div>
            </div>
          </div>

          {/* Lista de todos los coches */}
          <div className="data-grid">
            <h3 style={{color: '#bbf7d0', fontSize: '16px', margin: '0 0 12px 0'}}>
              Todos mis coches
            </h3>
            
            {userCars.map((car) => (
              <div key={car.id} className="data-item">
                <div className="data-label">
                  <span>{car.imagen}</span>
                  {car.marca} {car.modelo}
                </div>
                <div className="data-value" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                  <span style={{fontSize: '12px', color: '#a7f3d0'}}>
                    {car.tipoCombustible}
                  </span>
                  <span style={{fontSize: '12px', color: '#f9fafb'}}>
                    {car.rendimiento}
                  </span>
                  <span className={`status-badge ${car.estado.toLowerCase()}`}>
                    {car.estado}
                  </span>
                </div>
              </div>
            ))}
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
          <button className="modal-action-btn primary">
            Establecer como Principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarsModal;