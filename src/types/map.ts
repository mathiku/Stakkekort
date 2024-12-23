export interface WMSLayerConfig {
  id: string;
  name: string;
  url: string;
  layers: string;
  format: string;
  transparent: boolean;
  token?: string;
  requiresBlockId?: boolean;
  requiresWSOID?: boolean;
}