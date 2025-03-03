import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import proj4 from 'proj4';

// Define the coordinate systems
const epsg3857 = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
const epsg4326 = '+proj=longlat +datum=WGS84 +no_defs';

interface Point {
  coordinates: [number, number];
  properties: {
    pk: string;
    [key: string]: any;
  };
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    pk: string;
    [key: string]: any;
  };
}

export const useMapPoints = () => {
  const { pk } = useParams();
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!pk) return;

      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'hdgis:DynamicMapPoints',
        outputFormat: 'application/json',
        CQL_FILTER: `pk='${pk}'`
      };

      try {
        const url = `https://hdgis.gis.dk/geoserver/hdgis/ows?${new URLSearchParams(params)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const pointsData = data.features.map((feature: GeoJSONFeature) => {
            // Transform coordinates from EPSG:3857 to EPSG:4326
            const [lon, lat] = proj4(epsg3857, epsg4326, feature.geometry.coordinates);
            return {
              coordinates: [lon, lat] as [number, number],
              properties: feature.properties
            };
          });
          setPoints(pointsData);
        }
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    fetchPoints();
  }, [pk]);

  return points;
}; 