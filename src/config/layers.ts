import { WMSLayerConfig } from '../types/map';

export const wmsLayers: WMSLayerConfig[] = [
  /* {
    id: 'skaermkort',
    name: 'Skærmkort',
    url: 'https://api.dataforsyningen.dk/topo_skaermkort_DAF',
    layers: 'dtk_skaermkort',
    format: 'image/png',
    transparent: true,
    token: '1b6805e6b4e3c9d04af49b8245ab7b20'
  },
  {
    id: 'ortofoto',
    name: 'Ortofoto',
    url: 'https://api.dataforsyningen.dk/orto_foraar_DAF',
    layers: 'orto_foraar',
    format: 'image/png',
    transparent: true,
    token: '1b6805e6b4e3c9d04af49b8245ab7b20'
  }, */
  {
    id: 'skovkort',
    name: 'Skovkort',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:SkovkortDynamicMaps',
    format: 'image/png',
    transparent: true,
    requiresBlockId: true,
    drawOrder: 5
  },
  {
    id: 'ao',
    name: 'Arbejdsområde',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:DynamicMapStands',
    format: 'image/png',
    transparent: false,
    requiresWSOID: true,
    drawOrder: 6
  },
  {
    id: 'stakke',
    name: 'Stakke',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:DynamicMapPoints',
    format: 'image/png',
    transparent: true,
    requiresWSOID: true,
    drawOrder: 7
  },
  {
    id: 'hydro',
    name: 'Hydro',
    url: 'https://api.dataforsyningen.dk/forvaltning2',
    layers: 'Hydro',
    format: 'image/png',
    transparent: true,
    token: '1b6805e6b4e3c9d04af49b8245ab7b20',
    drawOrder: 2
  },
  {
    id: 'hojdekurver',
    name: 'Højdekurver',
    url: 'https://api.dataforsyningen.dk/forvaltning2',
    layers: 'Kurver',
    format: 'image/png',
    transparent: true,
    token: '1b6805e6b4e3c9d04af49b8245ab7b20',
    drawOrder: 3
  },
  {
    id: 'skyggekort',
    name: 'Skyggekort',
    url: 'https://api.dataforsyningen.dk/wms/dhm_temp',
    layers: 'quickDHM_skyggekort_terraen_overdrevet',
    format: 'image/png',
    transparent: true,
    token: '1b6805e6b4e3c9d04af49b8245ab7b20',
    drawOrder: 4
  },
  {
    id: 'paragraf3',
    name: 'Paragraf 3',
    url: 'https://arealeditering-dist-geo.miljoeportal.dk/geoserver/ows',
    layers: 'dai:bes_naturtyper',
    format: 'image/png',
    transparent: true,
    drawOrder: 1
  },
];