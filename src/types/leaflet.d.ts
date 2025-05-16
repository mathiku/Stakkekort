import * as L from 'leaflet';

declare module 'proj4leaflet' {
  export = L.Proj;
}

declare module 'leaflet' {
  namespace Proj {
    class CRS extends L.CRS {
      constructor(code: string, proj4def: string, options?: any);
    }
  }

  interface CRSNamespace {
    EPSG25832: L.CRS;
  }
  export const CRS: CRSNamespace;
} 