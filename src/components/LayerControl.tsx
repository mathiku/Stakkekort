import React from 'react';
import { WMSLayerConfig } from '../types/map';

interface LayerControlProps {
  layers: WMSLayerConfig[];
  activeLayers: string[];
  onLayerToggle: (layerId: string) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  activeLayers,
  onLayerToggle,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        Lag
      </h3>

      <div className="space-y-2">
        {layers.map((layer) => (
          <label key={layer.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeLayers.includes(layer.id)}
              onChange={() => onLayerToggle(layer.id)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-sm">{layer.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LayerControl;