import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import { wmsLayers } from '../config/layers';
import L from 'leaflet';

const Map = () => {
  const { pk } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);

  useEffect(() => {
    if (!pk) {
      setError('No primary key provided');
    }
  }, [pk]);

  const handleLayerToggle = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Get layers in correct draw order
  const orderedLayers = wmsLayers
    .filter(layer => activeLayers.includes(layer.id))
    .sort((a, b) => b.drawOrder - a.drawOrder);  // Higher drawOrder on top

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      <LayerControl
        layers={wmsLayers}
        activeLayers={activeLayers}
        onLayerToggle={handleLayerToggle}
      />
      <MapContainer
        bounds={[
          [55.2, 11.8],  // Southwest corner [lat, lng]
          [56.2, 13.2]   // Northeast corner [lat, lng]
        ]}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base map layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* WMS layers */}
        {orderedLayers.map(layer => (
          <WMSTileLayer
            key={layer.id}
            url={layer.url}
            layers={layer.layers}
            format={layer.format}
            transparent={layer.transparent}
            version="1.1.1"
            opacity={layer.id === 'skyggekort' ? 0.5 : 1}
            params={{
              layers: layer.layers,
              ...(layer.token && { token: layer.token }),
              ...(layer.requiresPK && { 
                CQL_FILTER: `pk='${pk}'`
              })
            }}
                      />
        ))}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

function LocationMarker() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      //map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default Map;