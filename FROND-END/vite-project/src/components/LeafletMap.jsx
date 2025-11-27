import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para gasolineras
const gasStationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDFIOUM4LjQ0NzcyIDEgOCAxLjQ0NzcyIDggMlYyMkM4IDIyLjU1MjMgOC40NDc3MiAyMyA5IDIzSDE1QzE1LjU1MjMgMjMgMTYgMjIuNTUyMyAxNiAyMlYyQzE2IDEuNDQ3NzIgMTUuNTUyMyAxIDE1IDFaIiBmaWxsPSIjMjJjNTVlIi8+CjxwYXRoIGQ9Ik0xOSA1SDE3VjE5SDE5QzE5LjU1MjMgMTkgMjAgMTguNTUyMyAyMCAxOFY2QzIwIDUuNDQ3NzIgMTkuNTUyMyA1IDE5IDVaIiBmaWxsPSIjMTZhMzRhIi8+CjxwYXRoIGQ9Ik01IDVIM1YxOUg1QzUuNTUyMjggMTkgNiAxOC41NTIzIDYgMThWNkM2IDUuNDQ3NzIgNS41NTIyOCA1IDUgNVoiIGZpbGw9IiMxNmEzNGEiLz4KPHJlY3QgeD0iMTAiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const LeafletMap = ({ showFilters }) => {
  // Coordenadas de ejemplo (puedes cambiarlas por tu ubicación)
  const defaultPosition = [18.1866353,-91.0471586]; // Ciudad de México
  
  // Datos de ejemplo de gasolineras
  const gasStations = [
    { id: 1, name: "Gasolinera Centro", position: [19.4326, -99.1332], price: "$22.50" },
    { id: 2, name: "Estación Norte", position: [19.4426, -99.1432], price: "$22.30" },
    { id: 3, name: "ServiGas Sur", position: [19.4226, -99.1232], price: "$22.70" },
  ];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      {/* Capa del mapa con tema oscuro */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        // Para un tema más oscuro puedes usar:
        // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Marcadores de gasolineras */}
      {gasStations.map(station => (
        <Marker
          key={station.id}
          position={station.position}
          icon={gasStationIcon}
        >
          <Popup>
            <div style={{ color: '#000' }}>
              <strong>{station.name}</strong>
              <br />
              Precio: {station.price}
              <br />
              <small>Abierta 24h</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;