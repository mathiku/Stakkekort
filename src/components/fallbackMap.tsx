import { useEffect, useState } from 'react';
import L from 'leaflet';
//interface for the layer check result
interface LayerCheckResult {
  isAvailable: boolean;
  message: string;
}
//method to check if the layer is available - if not, use fallback layer
const checkLayerAvailability = async (url: string): Promise<LayerCheckResult> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD'
    });
    //all's good
    return {
      isAvailable: response.status === 200,
      message: response.status === 200 ? 'Layer is available' : `Layer returned status ${response.status}`
    };
  } catch (error) {
    return {
      isAvailable: false,
      message: `Error checking layer: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
//create the dataforsyningen layer - in this case the default layer
const createDataforsyningenLayer = () => {
  return L.tileLayer('https://api.dataforsyningen.dk/topo_skaermkort_DAF/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Dataforsyningen'
  });
};
//create the datafordeler layer - in this case the fallback layer
const createDatafordelerLayer = () => {
  const username = 'CPANRANTMU';
  const password = '19qlcfFA!!';
    
  return L.tileLayer(
    `https://services.datafordeler.dk/Dkskaermkort/topo_skaermkort_wmts/1.0.0/wmts?username=${username}&password=${password}`, 
    {
      maxZoom: 19,
      attribution: 'Datafordeler'
    }
  );
};
//component exported to be used in the map component
export const checkAndCreateBackgroundLayer = async (): Promise<{
  layer: L.TileLayer;
  source: 'dataforsyningen' | 'datafordeler';
  message: string;
}> => {
  //dataforsyningenUrl - the url to check if the layer is available
  const dataforsyningenUrl = 'https://api.dataforsyningen.dk/topo_skaermkort_DAF/1/1/1.png';
  //check if the layer is available
  const result = await checkLayerAvailability(dataforsyningenUrl);

  if (result.isAvailable) {
    return {
      layer: createDataforsyningenLayer(),
      source: 'dataforsyningen',
      message: 'Using Dataforsyningen layer'
    };
  } else {
    //if the layer is not available, use the fallback layer
    return {
      layer: createDatafordelerLayer(),
      source: 'datafordeler',
      message: `Falling back to Datafordeler layer (${result.message})`
    };
  }
};
