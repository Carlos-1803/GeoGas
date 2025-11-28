import React, { useState, useEffect } from "react";
import "./home.css";
import LeafletMap from "../components/LeafletMap";
import RouteModal from "../components/RouteModal";
import CarsModal from "../components/CarsModal";

function Home({ onLogout }) {
  const [activeTab, setActiveTab] = useState("inicio");
  const [showFilters, setShowFilters] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showCarsModal, setShowCarsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [gasolinerasBD, setGasolinerasBD] = useState([]);

  const navItems = [
    { id: "inicio", icon: "🏠", label: "Inicio" },
    { id: "estaciones", icon: "⛽", label: "Estaciones" },
    { id: "coches", icon: "🚗", label: "Coches" },
    { id: "rutas", icon: "🧭", label: "Rutas" },
    { id: "perfil", icon: "👤", label: "Perfil" }
  ];

  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Obtener ubicación del usuario al cargar el componente
  useEffect(() => {
    obtenerUbicacionUsuario();
  }, []);

  // Obtener ubicación del usuario
  const obtenerUbicacionUsuario = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          console.log('Ubicación obtenida:', userCoords);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setUserLocation({ lat: 18.1866353, lng: -91.0471586 });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    }
  };

  // Función para navegar a una gasolinera (se llama desde RouteModal)
  const navegarAGasolinera = (gasolinera) => {
    if (!userLocation) {
      alert('Obteniendo tu ubicación...');
      obtenerUbicacionUsuario();
      return;
    }

    const newRouteData = {
      userCoords: userLocation,
      destinoCoords: gasolinera.position,
      destinoNombre: gasolinera.name,
      onGasStationSelect: navegarAGasolinera
    };

    setRouteData(newRouteData);
    setActiveTab("inicio");
    setShowRouteModal(false);
  };

  // Función para manejar el clic en el botón de rutas
  const handleRouteClick = () => {
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

  // Callback cuando se calcula una ruta
  const manejarRutaCalculada = (infoRuta) => {
    setRouteInfo(infoRuta);
    console.log('Información de la ruta calculada:', infoRuta);
  };

  // Actualizar summary data
  const summaryData = [
    {
      label: "Estaciones en BD",
      value: gasolinerasBD.length.toString(),
      hint: "Total en base de datos"
    },
    {
      label: "Mejor precio hoy",
      value: "Consultar",
      hint: "En gasolineras cercanas"
    },
    {
      label: userLocation ? "Tu ubicación" : "Obteniendo ubicación...",
      value: userLocation ? "✅ Activa" : "⌛ Cargando...",
      hint: userLocation ? 
        `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}` : 
        "Haz clic para actualizar"
    }
  ];

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
          {/* Botón de ubicación */}
          <button 
            className="icon-button location-btn" 
            aria-label="Actualizar ubicación"
            onClick={obtenerUbicacionUsuario}
            style={{ marginRight: '10px' }}
          >
            <span className="location-icon">📍</span>
          </button>

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
                  {routeData ? 
                    `Ruta a ${routeData.destinoNombre}` : 
                    "Usa el botón 'Rutas' para seleccionar una gasolinera"}
                  {routeInfo && ` · ${routeInfo.distancia} km · ${routeInfo.duracion} min`}
                </p>
              </div>
              <div className="map-header-buttons">
                {routeData && (
                  <button 
                    className="map-clear-route-btn" 
                    type="button"
                    onClick={() => setRouteData(null)}
                  >
                    🗑️ Limpiar ruta
                  </button>
                )}
                <button 
                  className="map-filter-btn" 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "✅ Filtros" : "🔍 Filtros"}
                </button>
              </div>
            </div>

            {/* Contenedor del mapa - Solo mostrará gasolineras de la BD */}
            <div className="map-placeholder">
              <LeafletMap 
                showFilters={showFilters} 
                routeData={routeData}
                onRouteCalculated={manejarRutaCalculada}
              />
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
        onNavigate={navegarAGasolinera}
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