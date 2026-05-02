import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import LocateButton from './LocateButton';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const fountainIcon = L.divIcon({
  html: '<div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg text-white">🚰</div>',
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const toiletIcon = L.divIcon({
  html: '<div class="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg text-white">🚻</div>',
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = L.divIcon({
  html: '<div class="relative flex items-center justify-center"><div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div><div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div></div>',
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const LocationMarker = ({ userLocation, setUserLocation }) => {
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return userLocation === null ? null : (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>Estás aquí</Popup>
    </Marker>
  );
};

const MapComponent = ({ onSelectService }) => {
  const [fountains, setFountains] = useState(null);
  const [toilets, setToilets] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/fountains.json`)
      .then(res => res.json())
      .then(data => setFountains(data));
    
    fetch(`${import.meta.env.BASE_URL}data/toilets.json`)
      .then(res => res.json())
      .then(data => setToilets(data));
  }, []);

  const onEachFeature = (type) => (feature, layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectService({ ...feature, type });
      }
    });
  };

  return (
    <MapContainer 
      center={[40.4168, -3.7038]} 
      zoom={14} 
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <LocationMarker userLocation={userLocation} setUserLocation={setUserLocation} />
      <LocateButton />

      {fountains && (
        <GeoJSON 
          data={fountains} 
          pointToLayer={(feature, latlng) => L.marker(latlng, { icon: fountainIcon })}
          onEachFeature={onEachFeature('fountain')}
        />
      )}

      {toilets && (
        <GeoJSON 
          data={toilets} 
          pointToLayer={(feature, latlng) => L.marker(latlng, { icon: toiletIcon })}
          onEachFeature={onEachFeature('toilet')}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
