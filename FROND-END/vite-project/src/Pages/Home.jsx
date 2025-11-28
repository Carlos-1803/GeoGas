import React, { useState } from "react";
import "./home.css";
import LeafletMap from "../components/LeafletMap";
import RouteModal from "../components/RouteModal";

function App() {
  const [activeTab, setActiveTab] = useState("inicio");
  const [showFilters, setShowFilters] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const navItems = [
    { id: "inicio", icon: "🏠", label: "Inicio" },
    { id: "estaciones", icon: "⛽", label: "Estaciones" },
    { id: "favoritos", icon: "⭐", label: "Favoritos" },
    { id: "rutas", icon: "🧭", label: "Rutas" },
    { id: "perfil", icon: "👤", label: "Perfil" }
  ];

  const summaryData = [
    {
      label: "Estaciones cercanas",
      value: "0",
      hint: "En un radio de 5 km"
    },
    {
      label: "Mejor precio hoy",
      value: "$0",
      hint: "Magna · Gasolinera Centro"
    },
    {
      label: "Rendimiento estimado",
      value: "0 km",
      hint: "Con tu tanque actual"
    }
  ];

  // Función para manejar el clic en el botón de rutas
  const handleRouteClick = () => {
    // Datos de ejemplo basados en tu modelo C# (sin userId)
    const mockRouteData = {
      ubicacion: "Av. Principal #123, Ciudad",
      destino: "Gasolinera Premium Center", 
      distancia: 3.2
      // userId removido
    };
    
    setRouteData(mockRouteData);
    setShowRouteModal(true);
  };

  return (
    <div className="app">
      {/* ===== TOP BAR ===== */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="brand">
            <div className="brand-logo">⛽</div>
            <div className="brand-text">
              <h1 className="brand-title">GeoGas Auto</h1>
              <p className="brand-subtitle">
                Encuentra la mejor gasolina cerca de ti
              </p>
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          {/* Botón de perfil */}
          <button className="icon-button profile-btn" aria-label="Perfil de usuario">
            <span className="avatar">RR</span>
          </button>

          {/* Icono de ajustes */}
          <button className="icon-button settings-btn" aria-label="Ajustes">
            <span className="settings-icon">⚙</span>
          </button>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="main-content">
        {/* Tarjetas resumen arriba del mapa */}
        <section className="summary-section">
          {summaryData.map((item, index) => (
            <div key={index} className="summary-card">
              <p className="summary-label">{item.label}</p>
              <p className="summary-value">{item.value}</p>
              <p className="summary-hint">{item.hint}</p>
            </div>
          ))}
        </section>

        {/* Sección para el mapa */}
        <section className="map-section">
          <div className="map-card">
            <div className="map-header">
              <div>
                <h2 className="map-title">Mapa de estaciones</h2>
                <p className="map-subtitle">
                  {showFilters 
                    ? "Filtros aplicados: Precio más bajo, Abiertas 24h" 
                    : "Aquí se mostrará el mapa interactivo con las gasolineras."}
                </p>
              </div>
              <button 
                className="map-filter-btn" 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "✅ Filtros" : "🔍 Filtros"}
              </button>
            </div>

            {/* Contenedor donde luego integrarás el mapa real (Leaflet, Google Maps, etc.) */}
            <div className="map-placeholder">
              <LeafletMap showFilters={showFilters} />
              <span className="map-placeholder-text">
                
                
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ===== BOTTOM NAV BAR ===== */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "nav-item--active" : ""}`}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === "rutas") {
                handleRouteClick();
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== MODAL DE RUTAS ===== */}
      <RouteModal 
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        routeData={routeData}
      />
    </div>
  );
}

export default App;