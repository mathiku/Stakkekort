import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, Marker, Popup, Polyline, LayerGroup } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet-overrides.css';  // Import our CSS overrides
import LayerControl from './LayerControl';
import { useMapPoints } from './MapPoints';
import { wmsLayers } from '../config/layers';
import L from 'leaflet';
import 'proj4';
import 'proj4leaflet';
import Logo from './Logo';
import MapLogo from './MapLogo';
import proj4 from 'proj4';
import 'leaflet.markercluster';

// Define EPSG:25832
const epsg25832 = new L.Proj.CRS(
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
  CRS: 'CRS:84',
  layers: DIGER_LAYER  // Add this to satisfy WMSParams type
};

interface RouteInfo {
  isVisible: boolean;
  points: [number, number][];
}

const Map = () => {
  const { pk } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isMapOutdated, setIsMapOutdated] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({ isVisible: false, points: [] });
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'skaermkort',  // Skærmkort
    'ao',          // AO
    'skovkort',    // Skovkort
    'veje',        // Vejtema
    'containermapsymbols', // Add map symbols initially since veje is active
    'vejemapsymbols',      // Add map symbols initially since veje is active
    'dynamicmappoints'     // Add new WMS stakke layer initially
  ]);
  const mapRef = useRef<L.Map | null>(null);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<L.LatLng | null>(null);
  const [mapReady, setMapReady] = useState(false);

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
          throw new Error(`No features found for ${typeName} with pk='${pk}'`);
        }
        return data.features[0].properties; // Returns { bbxmax, bbxmin, bbymax, bbymin, ... }
      };

      let pointsProperties = null;
      let standsProperties = null;

      try {
        // Attempt to fetch DynamicMapPoints - this is critical.
        pointsProperties = await tryFetch('hdgis:DynamicMapPoints');

        // Attempt to fetch DynamicMapStands - this is optional.
        try {
          standsProperties = await tryFetch('hdgis:DynamicMapStands');
        } catch (standsError) {
          console.warn(`Optional: Could not fetch stands properties (pk: ${pk}). Will proceed with points properties if available. Error: ${(standsError as Error).message}`);
          // standsProperties remains null, this is handled below.
        }

        // Now determine the bounding box based on what was successfully fetched.
        if (standsProperties && pointsProperties) {
          // Both sources available, combine them.
          const allBbysMin = [standsProperties.bbymin, pointsProperties.bbymin];
          const allBbxsMin = [standsProperties.bbxmin, pointsProperties.bbxmin];
          const allBbysMax = [standsProperties.bbymax, pointsProperties.bbymax];
          const allBbxsMax = [standsProperties.bbxmax, pointsProperties.bbxmax];

          const overallBbymin = Math.min(...allBbysMin.filter(v => typeof v === 'number'));
          const overallBbxmin = Math.min(...allBbxsMin.filter(v => typeof v === 'number'));
          const overallBbymax = Math.max(...allBbysMax.filter(v => typeof v === 'number'));
          const overallBbxmax = Math.max(...allBbxsMax.filter(v => typeof v === 'number'));

          if (
            typeof overallBbymin !== 'number' || !isFinite(overallBbymin) ||
            typeof overallBbxmin !== 'number' || !isFinite(overallBbxmin) ||
            typeof overallBbymax !== 'number' || !isFinite(overallBbymax) ||
            typeof overallBbxmax !== 'number' || !isFinite(overallBbxmax)
          ) {
            console.error('Invalid combined bounding box coordinates after fetching both sources.');
            throw new Error('Invalid combined bounding box coordinates.');
          }
          return [
            [overallBbymin, overallBbxmin],
            [overallBbymax, overallBbxmax]
          ] as [[number, number], [number, number]];

        } else if (pointsProperties) {
          // Only DynamicMapPoints was available (or stands failed).
          const { bbxmax, bbxmin, bbymax, bbymin } = pointsProperties;
          if (
            typeof bbymin !== 'number' || !isFinite(bbymin) ||
            typeof bbxmin !== 'number' || !isFinite(bbxmin) ||
            typeof bbymax !== 'number' || !isFinite(bbymax) ||
            typeof bbxmax !== 'number' || !isFinite(bbxmax)
          ) {
            console.error('Invalid bounding box coordinates from pointsProperties.');
            throw new Error('Invalid bounding box coordinates from pointsProperties.');
          }
          return [
            [bbymin, bbxmin],
            [bbymax, bbxmax]
          ] as [[number, number], [number, number]];
        } else {
          // This case (pointsProperties is null) should be caught by the outer catch if tryFetch for points throws.
          // If we reach here, something unexpected happened.
          throw new Error('Critical: DynamicMapPoints properties not available after fetch attempt.');
        }

      } catch (error) {
        // This catches failure from the initial tryFetch('hdgis:DynamicMapPoints') 
        // or any errors thrown during the processing of coordinates above.
        console.error(`Error in fetchFeatureInfo (pk: ${pk}): ${(error as Error).message}.`);
        
        // If both DynamicMapPoints and DynamicMapStands failed, the map is likely outdated
        setIsMapOutdated(true);
        return null; // Don't set bounds, let the component show the outdated message
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

  // Add map ready handler
  const handleMapReady = () => {
    setMapReady(true);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (isMapOutdated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-gray-800 text-lg mb-4">
            Kortet er ikke længere aktivt.
            Hvis dette er en fejl, så kontakt os på mail.
          </div>
          <div className="text-gray-600">
            Kontakt{' '}
            <a 
              href="mailto:ADegn@dalgas.com" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ADegn@dalgas.com
            </a>
          </div>
        </div>
      </div>
    );
  }

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
        ...layer.params
      };

      // Add all parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });

    }

    setActiveLayers(prev => {
      const newLayers = new Set(prev);
      
      if (layerId === 'veje') {
        const mapSymbolLayers = ['containermapsymbols', 'vejemapsymbols'];
        if (newLayers.has('veje')) {
          // Remove Vejtema and map symbols
          newLayers.delete('veje');
          mapSymbolLayers.forEach(symbolLayer => newLayers.delete(symbolLayer));
        } else {
          // Add Vejtema and map symbols
          newLayers.add('veje');
          mapSymbolLayers.forEach(symbolLayer => newLayers.add(symbolLayer));
        }
      } else if (!['containermapsymbols', 'vejemapsymbols'].includes(layerId)) {
        // Handle non-map-symbol layers normally
        if (newLayers.has(layerId)) {
          newLayers.delete(layerId);
        } else {
          newLayers.add(layerId);
        }
      }
      // Ignore direct toggling of map symbol layers as they're controlled by 'veje'
      
      return Array.from(newLayers);
    });
  };

  // Get layers in correct draw order
  const orderedLayers = wmsLayers
    .filter(layer => activeLayers.includes(layer.id))
    .sort((a, b) => b.drawOrder - a.drawOrder);  // Higher drawOrder on top

  /* console.log('Ordered layers:', orderedLayers.map(l => ({ id: l.id, drawOrder: l.drawOrder }))); */

  return (
    <div className="h-screen w-full relative">
      <LayerControl
        layers={wmsLayers}
        activeLayers={activeLayers}
        onLayerToggle={handleLayerToggle}
        routeInfo={routeInfo}
      />
      <MapContainer
        ref={mapRef}
        bounds={bounds}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
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
                  buffer: 64,
                  tiled: true,
                  tilesorigin: '0,0',
                  ...(layer.requiresPK && pk ? { CQL_FILTER: `pk='${pk}'` } : {}),
                  ...(layer.params || {})
                }}
              />
            );
          })}
        
        {/* Route display */}
        {routeInfo.isVisible && routeInfo.points.length > 0 && (
          <Polyline
            positions={routeInfo.points}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        )}
        
        <LocationMarker />
        <MapLogo />
        <DigerWMSLayer />
        <NavigateButton onRouteUpdate={(points) => setRouteInfo({ isVisible: true, points })} />
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

  // Create custom SVG icon
  const customIcon = L.divIcon({
    className: 'custom-location-marker',
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#2563EB" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="6" fill="#2563EB" />
      <circle cx="12" cy="12" r="3" fill="white" />
    </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

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
          // If DynamicMapPoints fails, try DynamicMapPoints
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
    <Marker position={position} icon={customIcon}>
      <Popup>Din position</Popup>
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

// Modify the NavigateButton component to accept onRouteUpdate
const NavigateButton = ({ onRouteUpdate }: { onRouteUpdate: (points: [number, number][]) => void }) => {
  const map = useMap();
  const points = useMapPoints();
  
  const handleNavigate = async () => {
    const center = map.getCenter();
    
    // Create waypoints string from points
    const waypoints = points
      .map(point => `${point.coordinates[1]},${point.coordinates[0]}`) // Convert to lat,lng format
      .join('|');
    
    // Build Google Maps URL with waypoints
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}${waypoints ? `&waypoints=${waypoints}` : ''}`;
    
    console.log('Opening navigation with points:', points);
    console.log('Google Maps URL:', googleMapsUrl);
    
    // Update route info with the current points
    const routePoints = points.map(point => point.coordinates as [number, number]);
    onRouteUpdate(routePoints);
    
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