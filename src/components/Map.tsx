import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import { useMapPoints } from './MapPoints';
import { wmsLayers } from '../config/layers';
import L, { bounds } from 'leaflet';
import 'proj4';
import 'proj4leaflet';

declare module 'leaflet' {
  namespace CRS {
    const EPSG25832: L.CRS;
  }
}

// Define EPSG:25832 if not already defined
L.CRS.EPSG25832 = new L.Proj.CRS(
  'EPSG:25832',
  '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  {
    resolutions: [
      8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5
    ],
    origin: [-2000000, 9000000],
    bounds: L.bounds([-2000000, 3500000], [4000000, 9000000])
  }
);

// Constants for the WMS layer
const DIGER_WMS_URL = 'https://areeleditering-dist-geo.miljoeportal.dk/geoserver/ows';
const DIGER_LAYER = 'dai:bes_sten_jorddiger_2022';

// WMS parameters
const wmsParams = {
  SERVICE: 'WMS',
  VERSION: '1.3.0',
  REQUEST: 'GetMap',
  LAYERS: DIGER_LAYER,
  STYLES: '',
  FORMAT: 'image/png',
  TRANSPARENT: true,
  DPI: 192,
  MAP_RESOLUTION: 192,
  FORMAT_OPTIONS: 'dpi:192',
  CRS: 'CRS:84'
};

const Map = () => {
  const { pk } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'skaermkort',  // Skærmkort
    'ao',          // AO
    'stakke',      // Stak
    'skovkort',    // Skovkort
    'veje'         // Vejtema
  ]);
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
    const layer = wmsLayers.find(l => l.id === layerId);
    if (layer && mapRef.current) {
      // Get current map bounds
      const mapBounds = mapRef.current.getBounds();
      const mapSize = mapRef.current.getSize();

      // Create base URL
      const url = new URL(layer.url);
      
      // Add WMS required parameters
      const params = {
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetMap',
        BBOX: `${mapBounds.getSouth()},${mapBounds.getWest()},${mapBounds.getNorth()},${mapBounds.getEast()}`,
        CRS: 'EPSG:4326',
        WIDTH: mapSize ? mapSize.x.toString() : '800',
        HEIGHT: mapSize ? mapSize.y.toString() : '600',
        LAYERS: layer.layers,
        STYLES: '',
        FORMAT: layer.format,
        DPI: '192',
        MAP_RESOLUTION: '192',
        FORMAT_OPTIONS: 'dpi:192',
        TRANSPARENT: layer.transparent.toString().toUpperCase(),
        ...layer.params // Add any layer-specific params (like username/password)
      };

      // Add all parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`Toggling layer: ${layer.name}`);
      console.log(`Complete WMS URL with current bounds:`);
      console.log(url.toString());
      console.log('Current map bounds:', mapBounds.toBBoxString());
      console.log('Current map size:', mapSize);
    }

    setActiveLayers(prev => {
      let newLayers = [...prev];
      
      if (layerId === 'veje') {
        // If toggling Vejtema, also toggle the map symbol layers
        if (prev.includes('veje')) {
          // Remove Vejtema and map symbols
          newLayers = newLayers.filter(id => 
            !['veje', 'containermapsymbols', 'vejemapsymbols'].includes(id)
          );
        } else {
          // Add Vejtema and map symbols
          newLayers.push('veje', 'containermapsymbols', 'vejemapsymbols');
        }
      } else {
        // Handle other layers normally
        newLayers = prev.includes(layerId)
          ? prev.filter(id => id !== layerId)
          : [...prev, layerId];
      }
      
      return newLayers;
    });
  };

  // Get layers in correct draw order
  const orderedLayers = wmsLayers
    .filter(layer => activeLayers.includes(layer.id))
    .sort((a, b) => b.drawOrder - a.drawOrder);  // Higher drawOrder on top

  /* console.log('Ordered layers:', orderedLayers.map(l => ({ id: l.id, drawOrder: l.drawOrder }))); */

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
            const isMapSymbol = layer.id === 'containermapsymbols' || layer.id === 'vejemapsymbols';
            return (
              <WMSTileLayer
                key={`wms-${layer.id}`}
                url={layer.url}
                layers={layer.layers}
                format="image/png"
                transparent={true}
                version={isMapSymbol ? '1.1.0' : layer.id === 'fredskov' ? '1.3.0' : '1.1.1'}
                opacity={layer.id === 'skyggekort' ? 0.5 : 1}
                zIndex={layer.drawOrder + 100}
                params={{
                  layers: layer.layers,
                  styles: '',
                  ...(layer.requiresPK && pk ? { CQL_FILTER: `pk='${pk}'` } : {}),
                  ...(layer.params || {})
                }}
              />
            );
          })}
        <LocationMarker />
        <DigerWMSLayer />
        <NavigateButton />
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

// Add the WMS layer to your map component
const DigerWMSLayer = () => {
  return (
    <WMSTileLayer
      url={DIGER_WMS_URL}
      params={wmsParams}
      opacity={0.7}
    />
  );
};

// Add this function inside the Map component
const NavigateButton = () => {
  const map = useMap();
  const points = useMapPoints();
  
  const handleNavigate = () => {
    const center = map.getCenter();
    
    // Create waypoints string from points
    const waypoints = points
      .map(point => `${point.coordinates[1]},${point.coordinates[0]}`) // Convert to lat,lng format
      .join('|');
    
    // Build Google Maps URL with waypoints
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}${waypoints ? `&waypoints=${waypoints}` : ''}`;
    
    console.log('Opening navigation with points:', points);
    console.log('Google Maps URL:', googleMapsUrl);
    
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <button 
      onClick={handleNavigate}
      className="absolute bottom-5 right-5 z-[1000] bg-white p-2 rounded-lg shadow-md hover:bg-gray-100"
      title="Navigate to this location"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
};

export default Map;