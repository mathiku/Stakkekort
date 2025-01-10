import { WMSLayerConfig } from '../types/map';

export const wmsLayers: WMSLayerConfig[] = [
  {
    id: 'ao',
    name: 'Arbejdsområde',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:DynamicMapStands',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 8
  },
  {
    id: 'stakke',
    name: 'Stakke',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:DynamicMapPoints',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 7
  },
  {
    id: 'skovkort',
    name: 'Skovkort',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:SkovkortDynamicMaps',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 5
  },
  {
    id: 'veje',
    name: 'Vejtema',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:VejtemaDynamicMaps',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 5
  },
  {
    id: 'paragraf3',
    name: 'Beskyttet natur §3',
    url: 'https://arealeditering-dist-geo.miljoeportal.dk/geoserver/ows',
    layers: 'dai:bes_naturtyper',
    format: 'image/png',
    transparent: true,
    drawOrder: 1
  },
  {
    id: 'fredninger',
    name: 'Fredninger',
    url: 'https://arealeditering-dist-geo.miljoeportal.dk/geoserver/wms',
    layers: 'fredede_omr',
    format: 'image/png',
    transparent: true,
    drawOrder: 1
  },
  {
   id: 'skaermkort',
   name: 'Skærmkort',
   url: 'https://api.dataforsyningen.dk/topo_skaermkort_DAF',
   layers: 'dtk_skaermkort',
   format: 'image/png',
   transparent: true,
   requiresPK: false,
   token: '1b6805e6b4e3c9d04af49b8245ab7b20',
   drawOrder: 0
  },
  {
   id: 'ortofoto',
   name: 'Ortofoto',
   url: 'https://api.dataforsyningen.dk/orto_foraar_DAF',
   layers: 'orto_foraar',
   format: 'image/png',
   transparent: true,
   requiresPK: false,
   token: '1b6805e6b4e3c9d04af49b8245ab7b20',
   drawOrder: 0
  },
];