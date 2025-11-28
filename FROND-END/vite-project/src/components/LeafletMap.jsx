import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados (mantener los mismos)
const gasStationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDFIOUM4LjQ0NzcyIDEgOCAxLjQ0NzcyIDggMlYyMkM4IDIyLjU1MjMgOC40NDc3MiAyMyA5IDIzSDE1QzE1LjU1MjMgMjMgMTYgMjIuNTUyMyAxNiAyMlYyQzE2IDEuNDQ3NzIgMTUuNTUyMyAxIDE1IDFaIiBmaWxsPSIjMjJjNTVlIi8+CjxwYXRoIGQ9Ik0xOSA1SDE3VjE5SDE5QzE5LjU1MjMgMTkgMjAgMTguNTUyMyAyMCAxOFY2QzIwIDUuNDQ3NzIgMTkuNTUyMyA1IDE5IDVaIiBmaWxsPSIjMTZhMzRhIi8+CjxwYXRoIGQ9Ik01IDVIM1YxOUg1QzUuNTUyMjggMTkgNiAxOC41NTIzIDYgMThWNkM2IDUuNDQ3NzIgNS41NTIyOCA1IDUgNVoiIGZpbGw9IiMxNmEzNGEiLz4KPHJlY3QgeD0iMTAiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzNzgxZTYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSIzIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTVDMTAgMTUgOCAxNiA3IDE4SDE3QzE2IDE2IDE0IDE1IDEyIDE1WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlYjEzMTMiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const LeafletMap = ({ showFilters, routeData, onRouteCalculated }) => {
  const mapRef = useRef();
  const [ruta, setRuta] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const defaultPosition = [18.1866353, -91.0471586];
  
  const gasStations = [
  ];

  // Función para obtener ruta real usando OSRM
  const obtenerRutaReal = async (inicio, fin) => {
    setLoading(true);
    try {
      const startLngLat = `${inicio[1]},${inicio[0]}`;
      const endLngLat = `${fin[1]},${fin[0]}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${startLngLat};${endLngLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordenadas = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRuta(coordenadas);
        
        const distancia = (data.routes[0].distance / 1000).toFixed(2);
        const duracion = (data.routes[0].duration / 60).toFixed(1);
        
        const info = { distancia, duracion };
        setRouteInfo(info);
        
        // Llamar al callback si existe
        if (onRouteCalculated) {
          onRouteCalculated(info);
        }
        
        return info;
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      const rutaSimplificada = calcularRutaSimplificada(inicio, fin);
      setRuta(rutaSimplificada);
      return { distancia: 'N/A', duracion: 'N/A' };
    } finally {
      setLoading(false);
    }
  };

  const calcularRutaSimplificada = (inicio, fin) => {
    const puntosIntermedios = [];
    const steps = 20;
    
    for (let i = 1; i < steps; i++) {
      const lat = inicio[0] + (fin[0] - inicio[0]) * (i / steps);
      const lng = inicio[1] + (fin[1] - inicio[1]) * (i / steps);
      puntosIntermedios.push([lat, lng]);
    }
    
    return [inicio, ...puntosIntermedios, fin];
  };

  useEffect(() => {
    if (routeData && routeData.userCoords && routeData.destinoCoords) {
      const inicio = [routeData.userCoords.lat, routeData.userCoords.lng];
      const fin = routeData.destinoCoords;
      
      obtenerRutaReal(inicio, fin);
    } else {
      setRuta(null);
      setRouteInfo(null);
    }
  }, [routeData]);

  useEffect(() => {
    if (ruta && mapRef.current) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(ruta);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ruta]);

  return (
    <MapContainer
      ref={mapRef}
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          border: '2px solid #3781e6',
          fontWeight: 'bold'
        }}>
          🗺️ Calculando la mejor ruta...
        </div>
      )}
      
      {ruta && (
        <Polyline
          positions={ruta}
          color="#3781e6"
          weight={6}
          opacity={0.8}
        />
      )}
      
      {routeData && routeData.userCoords && (
        <Marker
          position={[routeData.userCoords.lat, routeData.userCoords.lng]}
          icon={userIcon}
        >
          <Popup>
            <div style={{ color: '#000', textAlign: 'center' }}>
              <strong>📍 Tu Ubicación</strong>
              <br />
              <small>Lat: {routeData.userCoords.lat.toFixed(6)}</small>
              <br />
              <small>Lng: {routeData.userCoords.lng.toFixed(6)}</small>
            </div>
          </Popup>
        </Marker>
      )}
      
      {routeData && routeData.destinoCoords && (
        <Marker
          position={routeData.destinoCoords}
          icon={destinationIcon}
        >
          <Popup>
            <div style={{ color: '#000', textAlign: 'center' }}>
              <strong>🎯 Destino</strong>
              <br />
              <small>{routeData.destinoNombre || 'Gasolinera'}</small>
              {routeInfo && (
                <>
                  <br />
                  <small>Distancia: {routeInfo.distancia} km</small>
                  <br />
                  <small>Duración: {routeInfo.duracion} min</small>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}
      
      {!ruta && gasStations.map(station => (
        <Marker
          key={station.id}
          position={station.position}
          icon={gasStationIcon}
        >
          <Popup>
            <div style={{ color: '#000', textAlign: 'center' }}>
              <strong>{station.name}</strong>
              <br />
              Precio: {station.price}
              <br />
              <small>Abierta 24h</small>
              <br />
              <button 
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#3781e6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => {
                  // Esta función debería venir del componente padre
                  if (routeData?.onGasStationSelect) {
                    routeData.onGasStationSelect(station);
                  }
                }}
              >
                🗺️ Navegar aquí
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;