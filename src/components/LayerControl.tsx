import React, { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768); // Collapsed by default on small screens

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-[1000]">
      {/* Header - always visible */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-semibold">Lag</h3>
        <span className="ml-2">
          {isCollapsed ? '▼' : '▲'}
        </span>
      </div>

      {/* Collapsible content */}
      <div className={`${isCollapsed ? 'hidden' : 'block'} p-4 pt-0 max-h-[calc(100vh-8rem)] overflow-y-auto`}>
        {layers.map((layer) => (
          <label key={layer.id} className="flex items-center space-x-2 mb-2">
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