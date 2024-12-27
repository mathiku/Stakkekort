import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import { wmsLayers } from '../config/layers';

const Map = () => {
  const { combinedkId } = useParams();
  const [blockId, wsoid] = combinedkId?.split('_') ?? [];
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);

  useEffect(() => {
    if (!blockId) {
      setError('No block ID provided');
    }
    if (!wsoid) {
      setError('No WSOID provided');
    }
  }, [blockId, wsoid]);

  const handleLayerToggle = (layerId: string) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

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
        center={[55.7, 12.5]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base map layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* WMS layers */}
        {activeLayers.map(layerId => {
          const layer = wmsLayers.find(l => l.id === layerId);
          if (!layer) return null;

          return (
            <WMSTileLayer
              key={layer.id}
              url={layer.url}
              layers={layer.layers}
              format={layer.format}
              transparent={layer.transparent}
              version="1.1.0"
              opacity={layer.id === 'skyggekort' ? 0.5 : 1}
              params={{
                layers: layer.layers,
                ...(layer.token ? { token: layer.token } : {}),
                ...(layer.id === 'ao' || layer.id === 'stakke' 
                  ? { CQL_FILTER: `blockid='${blockId}' AND workingsiteid='${wsoid}'` }
                  : layer.requiresBlockId 
                    ? { CQL_FILTER: `blockid='${blockId}'` }
                    : {})
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;