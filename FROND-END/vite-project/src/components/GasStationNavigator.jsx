// components/GasStationNavigator.js
import React, { useState } from 'react';
import LeafletMap from './LeafletMap';

const GasStationNavigator = () => {
  const [routeData, setRouteData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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
          alert(`Ubicación obtenida: ${userCoords.lat}, ${userCoords.lng}`);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener la ubicación. Usando ubicación por defecto.');
          // Ubicación por defecto
          setUserLocation({ lat: 18.1866353, lng: -91.0471586 });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    } else {
      alert('La geolocalización no es soportada por este navegador.');
    }
  };

  // Navegar a una gasolinera
  const navegarAGasolinera = (gasolinera) => {
    if (!userLocation) {
      alert('Primero obtén tu ubicación actual');
      return;
    }

    setRouteData({
      userCoords: userLocation,
      destinoCoords: gasolinera.position,
      destinoNombre: gasolinera.name,
      onGasStationSelect: navegarAGasolinera
    });
  };

  // Limpiar ruta
  const limpiarRuta = () => {
    setRouteData(null);
  };

  // Callback cuando se calcula la ruta
  const manejarRutaCalculada = (infoRuta) => {
    console.log('Información de la ruta:', infoRuta);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Controles */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={obtenerUbicacionUsuario}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📍 Obtener Mi Ubicación
        </button>

        <button
          onClick={limpiarRuta}
          disabled={!routeData}
          style={{
            padding: '10px 20px',
            backgroundColor: routeData ? '#dc3545' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: routeData ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          🗑️ Limpiar Ruta
        </button>

        {userLocation && (
          <div style={{ 
            padding: '8px 16px', 
            backgroundColor: '#d4edda', 
            borderRadius: '5px',
            color: '#155724',
            fontWeight: 'bold'
          }}>
            ✅ Ubicación obtenida
          </div>
        )}
      </div>

      {/* Lista de gasolineras */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3>🏪 Gasolineras Disponibles:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {gasStations.map(station => (
            <div
              key={station.id}
              style={{
                padding: '10px 15px',
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
                minWidth: '200px'
              }}
            >
              <strong>{station.name}</strong>
              <br />
              <small>Precio: {station.price}</small>
              <br />
              <button
                onClick={() => navegarAGasolinera(station)}
                disabled={!userLocation}
                style={{
                  marginTop: '5px',
                  padding: '5px 10px',
                  backgroundColor: userLocation ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: userLocation ? 'pointer' : 'not-allowed',
                  fontSize: '12px'
                }}
              >
                {userLocation ? '🗺️ Navegar' : 'Primero obtén ubicación'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: 'relative' }}>
        <LeafletMap 
          routeData={routeData}
          onRouteCalculated={manejarRutaCalculada}
        />
      </div>
    </div>
  );
};

export default GasStationNavigator;