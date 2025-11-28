import React, { useState } from "react";
import "./home.css";
import LeafletMap from "../components/LeafletMap";
import RouteModal from "../components/RouteModal";
import CarsModal from "../components/CarsModal";

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [showFilters, setShowFilters] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showCarsModal, setShowCarsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Estado para menú de perfil
  const [routeData, setRouteData] = useState(null);

  const navItems = [
    { id: "inicio", icon: "🏠", label: "Inicio" },
    { id: "estaciones", icon: "⛽", label: "Estaciones" },
    { id: "coches", icon: "🚗", label: "Coches" },
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

  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Función para manejar el clic en el botón de rutas
  const handleRouteClick = () => {
    const mockRouteData = {
      ubicacion: "Av. Principal #123, Ciudad",
      destino: "Gasolinera Premium Center", 
      distancia: 3.2
    };
    
    setRouteData(mockRouteData);
    setShowRouteModal(true);
  };

  // Función para manejar el clic en el botón de coches
  const handleCarsClick = () => {
    setShowCarsModal(true);
  };

  // Función para manejar el clic en el botón de perfil
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    onLogout();
  };

  // Función para cerrar el menú de perfil al hacer clic fuera
  const handleClickOutside = (e) => {
    if (!e.target.closest('.profile-container')) {
      setShowProfileMenu(false);
    }
  };

  // Agregar event listener para cerrar el menú al hacer clic fuera
  React.useEffect(() => {
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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
                Bienvenido, {userData.Nombre || 'Usuario'}
              </p>
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          {/* Botón de perfil con menú desplegable */}
          <div className="profile-container">
            <button 
              className="icon-button profile-btn" 
              aria-label="Perfil de usuario"
              onClick={handleProfileClick}
            >
              <span className="avatar">
                {userData.Nombre ? userData.Nombre.charAt(0).toUpperCase() : 'U'}
              </span>
            </button>
            
            {/* Menú desplegable del perfil */}
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <p><strong>{userData.Nombre || 'Usuario'}</strong></p>
                  <p className="profile-email">{userData.Correo || ''}</p>
                </div>
                <div className="profile-actions">
                  <button className="profile-menu-item">
                    👤 Mi Perfil
                  </button>
                  <button className="profile-menu-item">
                    ⚙️ Configuración
                  </button>
                  <button className="profile-menu-item">
                    📊 Mis Estadísticas
                  </button>
                  <button 
                    className="profile-menu-item logout-item"
                    onClick={handleLogout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>

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

            {/* Contenedor del mapa */}
            <div className="map-placeholder">
              <LeafletMap showFilters={showFilters} />
              <span className="map-placeholder-text"></span>
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
              if (item.id === "coches") {
                handleCarsClick();
              }
              if (item.id === "perfil") {
                handleProfileClick();
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

      {/* ===== MODAL DE COCHES ===== */}
      <CarsModal 
        isOpen={showCarsModal}
        onClose={() => setShowCarsModal(false)}
      />
    </div>
  );
}

export default Home;