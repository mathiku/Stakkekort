export interface WMSLayerConfig {
  id: string;
  name: string;
  url: string;
  layers: string;
  format: string;
  transparent: boolean;
  drawOrder: number;
  requiresPK?: boolean;
  token?: string;
  params?: WMSParams;
}

export interface WMSParams {
  layers?: string;
  styles?: string;
  format?: string;
  transparent?: boolean;
  version?: string;
  buffer?: number | string;
  tiled?: boolean;
  tilesorigin?: string;
  CQL_FILTER?: string;
  token?: string;
  [key: string]: any;
}