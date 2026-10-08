"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const riskIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
}

export default function Map() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    fetch('/detections.json')
      .then(res => res.json())
      .then(data => setThreats(data))
      .catch(err => console.log("Awaiting detections..."));
  }, []);

  const centerPos = threats.length > 0 ? [threats[0].lat, threats[0].lng] : [22.5726, 88.3639];

  return (
    <MapContainer center={centerPos} zoom={18} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {threats.length > 0 && <RecenterMap position={centerPos} />}
      {threats.map((site) => (
        <Marker key={site.id} position={[site.lat, site.lng]} icon={riskIcon}>
          <Popup>
            <div style={{ width: '220px' }}>
              <h3 style={{ margin: '8px 0 4px', color: '#ff1744' }}>HIGH RISK: {site.label.toUpperCase()}</h3>
              <p>AI Confidence: {Math.round(site.confidence * 100)}%</p>
              <img src={site.image} alt="Detection" style={{ width: '100%', borderRadius: '4px' }} />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
