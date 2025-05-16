import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface SiteInfo {
  workingsitename: string;
  workingsiteid: string;
}

export const useSiteInfo = () => {
  const { pk } = useParams();
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    if (!pk) return;

    const fetchSiteInfo = async () => {
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
        const { workingsitename, workingsiteid } = data.features[0].properties;
        setSiteInfo({ workingsitename, workingsiteid });
      } catch (error) {
        try {
          // If DynamicMapStands fails, try DynamicMapPoints
          const data = await tryFetch('hdgis:DynamicMapPoints');
          const { workingsitename, workingsiteid } = data.features[0].properties;
          setSiteInfo({ workingsitename, workingsiteid });
        } catch (fallbackError) {
          console.error('Error fetching site info:', fallbackError);
          setSiteInfo(null);
        }
      }
    };

    fetchSiteInfo();
  }, [pk]);

  return siteInfo;
}; 