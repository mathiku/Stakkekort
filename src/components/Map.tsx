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
  
  useEffect(() => {
    if (!pk) return;
    
    const fetchFeatureInfo = async () => {
      const wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'hdgis:DynamicMapStands',
        maxFeatures: '1',
        outputFormat: 'application/json',
        CQL_FILTER: `pk='${pk}'`
      };
      
      const url = `https://hdgis.gis.dk/geoserver/hdgis/ows?${new URLSearchParams(wfsParams)}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
        console.log('Fetched bounds:', { bbxmax, bbxmin, bbymax, bbymin });
        const newBounds = [
          [bbymin, bbxmin],  // Southwest corner [lat, lng]
          [bbymax, bbxmax]   // Northeast corner [lat, lng]
        ] as [[number, number], [number, number]];
        console.log('Formatted bounds:', newBounds);
        return newBounds;
      } catch (error) {
        console.error('Error fetching feature info:', error);
        return [
          [54, 8],
          [58, 16]
        ] as [[number, number], [number, number]];
      }
    };
    
    const fetchAndSetBounds = async () => {
      const bounds = await fetchFeatureInfo();
      console.log('Setting bounds to:', bounds);
      if (bounds) {
        setBounds(bounds);
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds);
        }
      }
    };

    fetchAndSetBounds();
  }, [pk]);
  
  const [bounds, setBounds] = useState<[[number, number], [number, number]]>([
    [54, 8],  // Default bounds for Denmark
    [58, 16]
  ]);
  
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
        ref={mapRef}
        bounds={bounds}
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
      const wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'hdgis:DynamicMapStands',
        maxFeatures: '1',
        outputFormat: 'application/json',
        CQL_FILTER: `pk='${pk}'`
      };

      const url = `https://hdgis.gis.dk/geoserver/hdgis/ows?${new URLSearchParams(wfsParams)}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        const { bbxmax, bbxmin, bbymax, bbymin } = data.features[0].properties;
        console.log({ bbxmax, bbxmin, bbymax, bbymin });
        setBounds([
          [bbymin, bbxmin],  // Southwest corner [lat, lng]
          [bbymax, bbxmax]   // Northeast corner [lat, lng]
        ]);
      } catch (error) {
        console.error('Error fetching feature info:', error);
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