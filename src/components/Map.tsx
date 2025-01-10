import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import { wmsLayers } from '../config/layers';
import L, { bounds } from 'leaflet';

const Map = () => {
  const { pk } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['ao', 'stakke']);
  const mapRef = useRef<L.Map | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);  // Start with null

  useEffect(() => {
    if (!pk) return;
    
    const fetchFeatureInfo = async () => {
      const getWfsParams = (typeName: string) => ({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName,
        maxFeatures: '1',
        outputFormat: 'application/json',
        CQL_FILTER: `pk='${pk}'`
      });
      
      const tryFetch = async (typeName: string) => {
        const url = `https://hdgis.gis.dk/geoserver/hdgis/ows?${new URLSearchParams(getWfsParams(typeName))}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.features || data.features.length === 0) {
          throw new Error('No features found');
        }
        return data;
      };
      
      try {
        // Try DynamicMapStands first
        const data = await tryFetch('hdgis:DynamicMapStands');
        const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
        return [
          [bbymin, bbxmin],  // Southwest corner [lat, lng]
          [bbymax, bbxmax]   // Northeast corner [lat, lng]
        ] as [[number, number], [number, number]];
      } catch (error) {
        try {
          // If DynamicMapStands fails, try DynamicMapPoints
          const data = await tryFetch('hdgis:DynamicMapPoints');
          const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
          return [
            [bbymin, bbxmin],  // Southwest corner [lat, lng]
            [bbymax, bbxmax]   // Northeast corner [lat, lng]
          ] as [[number, number], [number, number]];
        } catch (fallbackError) {
          console.error('Error fetching feature info:', fallbackError);
          return [
            [54, 8],
            [58, 16]
          ] as [[number, number], [number, number]];
        }
      }
    };
    
    const fetchAndSetBounds = async () => {
      const bounds = await fetchFeatureInfo();
      if (bounds) {
        setBounds(bounds);
      }
    };

    fetchAndSetBounds();
  }, [pk]);

  if (!bounds) {
    return <div>Henter lag...</div>;  // Or your preferred loading indicator
  }

  const handleLayerToggle = (layerId: string) => {
    console.log('Before toggle - Active layers:', activeLayers);
    console.log('Toggling layer:', layerId);
    setActiveLayers(prev => {
      const newLayers = prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId];
      console.log('After toggle - Active layers:', newLayers);
      return newLayers;
    });
  };

  // Get layers in correct draw order
  const orderedLayers = wmsLayers
    .filter(layer => activeLayers.includes(layer.id))
    .sort((a, b) => b.drawOrder - a.drawOrder);  // Higher drawOrder on top

  console.log('Ordered layers:', orderedLayers.map(l => ({ id: l.id, drawOrder: l.drawOrder })));

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
        ref={mapRef}
        bounds={bounds}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base map layer */}
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Base WMS layers (ortofoto and skaermkort) */}
        {orderedLayers
          .filter(layer => layer.id === 'ortofoto' || layer.id === 'skaermkort')
          .map(layer => (
            <WMSTileLayer
              key={`wms-${layer.id}`}
              url={layer.url}
              layers={layer.layers}
              format={layer.format}
              transparent={layer.transparent}
              version="1.1.1"
              zIndex={1}
              params={{
                layers: layer.layers,
                ...(layer.token ? { token: layer.token } : {})
              }}
            />
          ))}
        
        {/* Overlay WMS layers */}
        {orderedLayers
          .filter(layer => layer.id !== 'ortofoto' && layer.id !== 'skaermkort')
          .map(layer => {
            console.log('Rendering overlay layer:', layer.id, {
              transparent: layer.transparent,
              drawOrder: layer.drawOrder,
              hasToken: !!layer.token,
              requiresPK: layer.requiresPK
            });
            return (
              <WMSTileLayer
                key={`wms-${layer.id}`}
                url={layer.url}
                layers={layer.layers}
                format={layer.format}
                transparent={layer.transparent}
                version="1.1.1"
                opacity={layer.id === 'skyggekort' ? 0.5 : 1}
                zIndex={layer.drawOrder + 100} // Ensure overlays are always above base layers
                params={{
                  layers: layer.layers,
                  ...(layer.token ? { token: layer.token } : {}),
                  ...(layer.requiresPK && pk ? { 
                    CQL_FILTER: `pk='${pk}'`
                  } : {})
                }}
              />
            );
          })}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

function LocationMarker() {
  const { pk } = useParams();
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]]>([
    [54, 8],  // Default bounds
    [58, 16]
  ]);

  useEffect(() => {
    if (!map || !pk) return;
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      //map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  useEffect(() => {
    if (!map || !pk) return;

    const fetchFeatureInfo = async () => {
      const getWfsParams = (typeName: string) => ({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName,
        maxFeatures: '1',
        outputFormat: 'application/json',
        CQL_FILTER: `pk='${pk}'`
      });
      
      const tryFetch = async (typeName: string) => {
        const url = `https://hdgis.gis.dk/geoserver/hdgis/ows?${new URLSearchParams(getWfsParams(typeName))}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.features || data.features.length === 0) {
          throw new Error('No features found');
        }
        return data;
      };

      try {
        // Try DynamicMapStands first
        const data = await tryFetch('hdgis:DynamicMapStands');
        const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
        setBounds([
          [bbymin, bbxmin],  // Southwest corner [lat, lng]
          [bbymax, bbxmax]   // Northeast corner [lat, lng]
        ]);
      } catch (error) {
        try {
          // If DynamicMapStands fails, try DynamicMapPoints
          const data = await tryFetch('hdgis:DynamicMapPoints');
          const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
          setBounds([
            [bbymin, bbxmin],  // Southwest corner [lat, lng]
            [bbymax, bbxmax]   // Northeast corner [lat, lng]
          ]);
        } catch (fallbackError) {
          console.error('Error fetching feature info:', fallbackError);
        }
      }
    };

    fetchFeatureInfo();
  }, [map, pk]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default Map;