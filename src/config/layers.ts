import { WMSLayerConfig } from '../types/map';

export const wmsLayers: WMSLayerConfig[] = [
  
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
   drawOrder: 1
  },
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
    id: 'containermapsymbols',
    name: 'Containermapsymbols',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:MapsymbolsDynamicMapsPoints',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 10
  },
  {
    id: 'vejemapsymbols',
    name: 'Vejemapsymbols',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:MapsymbolsDynamicMapsPolygons',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 11
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
    id: 'beregnetrute',
    name: 'Beregnet rute',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:CalculatedRoutesHDStak',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 12
  },
  {
    id: 'veje',
    name: 'Vejtema',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:VejtemaDynamicMaps',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 6
  }/* ,
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
    id: 'naturhensyn',
    name: 'Naturhensyn',
    url: 'https://hdgis.gis.dk/geoserver/hdgis/wms',
    layers: 'hdgis:NaturhensynDynamicMaps',
    format: 'image/png',
    transparent: true,
    requiresPK: true,
    drawOrder: 5
  },
  {
    id: 'fortidsminder',
    name: 'Fortidsminder',
    url: 'https://www.kulturarv.dk/ffgeoserver/public/wms',
    layers: 'fundogfortidsminder_punkt_fredet',
    format: 'image/png',
    transparent: true,
    drawOrder: 1
  },
  {
    id: 'diger',
    name: 'Beskyttede sten- og jorddiger',
    url: 'https://arealeditering-dist-geo.miljoeportal.dk/geoserver/wms',
    layers: 'dai:bes_sten_jorddiger_2022',
    format: 'image/png',
    transparent: true,
    drawOrder: 1
  },
  {
    id: 'beskyttelseslinjer',
    name: 'Beskyttelseslinjer',
    url: 'https://www.kulturarv.dk/ffgeoserver/public/wms',
    layers: 'fundogfortidsminder_areal_beskyttelse',
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
    id: 'fredskov',
    name: 'Fredskov',
    url: 'https://services.datafordeler.dk/MATRIKLEN2/MatGaeldendeOgForeloebigWMS/1.0.0/Wms',
    layers: 'FredskovFlade_Gaeldende',
    format: 'image/png',
    transparent: true,
    drawOrder: 15,
    params: {
      username: 'UFZLDDPIJS',
      password: 'DAIdatafordel123'
    }
  },
  {
    id: 'natura2000',
    name: 'Natura 2000',
    url: 'https://miljoegis.mim.dk/wms',
    layers: 'theme-pg-natura_2000_omraader',
    format: 'image/png',
    transparent: true,
    drawOrder: 13,
    params: {
      servicename: 'miljoegis-natura2000_wms'
    }
  },
  {
    id: 'hnv',
    name: 'HNV',
    url: 'https://arld-extgeo.miljoeportal.dk/geoserver/ows',
    layers: 'hnv:HNV2021_20210226',
    format: 'image/png',
    transparent: true,
    drawOrder: 14
  } */
];