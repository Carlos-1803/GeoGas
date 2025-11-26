// src/components/LeafletMap.jsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importa los estilos CSS de Leaflet

function LeafletMap() {
  // Coordenadas de la Ciudad de México para centrar el mapa
  const position = [18.184938, -91.046009]; 

  return (
    // Es CRUCIAL que el contenedor del mapa tenga una altura definida en CSS
    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      
      {/* Proveedor de las imágenes del mapa (OpenStreetMap es el default) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Ejemplo de un marcador */}
      <Marker position={position}>
        <Popup>
          Centro de CDMX.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default LeafletMap;