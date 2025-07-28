import React, { useState } from 'react';
import { WMSLayerConfig } from '../types/map';
import { useSiteInfo } from '../hooks/useSiteInfo';
import VejtemaLegend from './vejtemalegend';
import StakkeLegend from './stakkelegend';

interface LayerControlProps {
  layers: WMSLayerConfig[];
  activeLayers: string[];
  onLayerToggle: (layerId: string) => void;
  routeInfo: {
    isVisible: boolean;
    points: [number, number][];
  };
}

const LayerLegend: React.FC<{ layer: WMSLayerConfig }> = ({ layer }) => {
  const legendUrl = `${layer.url}?service=WMS&request=GetLegendGraphic&version=1.1.1&format=image/png&layer=${layer.layers}`;
  
  return (
    <div className="mt-1 ml-6">
      <img src={legendUrl} alt={`Legend for ${layer.name}`} className="max-w-full" />
    </div>
  );
};

const SiteInfoHeader: React.FC<{ siteInfo: { workingsitename: string; workingsiteid: string; timestamp: string } }> = ({ siteInfo }) => (
  <div className="px-4 pb-3">
    <div className="mb-1">
      <span className="block text-sm text-gray-500 mt-0.5 leading-tight">
        Opgavenavn:
      </span>
      <span className="block text-sm text-gray-700 mt-0.5 leading-tight">
        {siteInfo.workingsitename}
      </span>
    </div>
    <div className="mt-1.5">
      <span className="block text-sm text-gray-500 mt-0.5 leading-tight">
        AO#:
      </span>
      <span className="block text-sm text-gray-700 mt-0.5 leading-tight">
        {siteInfo.workingsiteid}
      </span>
    </div>
    <div className="mt-1.5">
      <span className="block text-sm text-gray-500 mt-0.5 leading-tight">
        Dato:
      </span>
      <span className="block text-sm text-gray-700 mt-0.5 leading-tight">
        {siteInfo.timestamp ? new Date(siteInfo.timestamp).toLocaleDateString('da-DK') : 'Ikke tilgængelig'}
      </span>
    </div>
  </div>
);

const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  activeLayers,
  onLayerToggle,
  routeInfo
}) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const siteInfo = useSiteInfo();

  // Filter out the map symbol layers
  const visibleLayers = layers.filter(
    layer => !['containermapsymbols', 'vejemapsymbols'].includes(layer.id)
  );

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-[1000]">
      {/* Header - always visible */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between border-b border-gray-200"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Lag</span>
        <span className="ml-2 text-gray-500 text-sm">
          {isCollapsed ? '▼' : '▲'}
        </span>
      </div>

      {/* Collapsible content */}
      <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
        {/* Site Info */}
        {siteInfo && (
          <div className="pt-2 border-b border-gray-200">
            <SiteInfoHeader siteInfo={siteInfo} />
          </div>
        )}
        
        {/* Layer list */}
        <div className="p-4 pt-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {/* WMS Stakke layer at the top */}
          {(() => {
            const stakkeWMSLayer = visibleLayers.find(layer => layer.id === 'dynamicmappoints');
            return stakkeWMSLayer ? (
              <div key={stakkeWMSLayer.id} className="flex items-start py-1">
                <input
                  type="checkbox"
                  id={stakkeWMSLayer.id}
                  checked={activeLayers.includes(stakkeWMSLayer.id)}
                  onChange={() => onLayerToggle(stakkeWMSLayer.id)}
                  className="mt-1 mr-2.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={stakkeWMSLayer.id} className="text-sm text-gray-700 leading-tight cursor-pointer">
                  {stakkeWMSLayer.name}
                </label>
                {activeLayers.includes(stakkeWMSLayer.id) && <StakkeLegend />}
              </div>
            ) : null;
          })()}
          
          {/* Other WMS layers (excluding the dynamicmappoints which is shown at top) */}
          {visibleLayers
            .filter(layer => layer.id !== 'dynamicmappoints')
            .map((layer) => (
            <div key={layer.id} className="flex items-start py-1">
              <input
                type="checkbox"
                id={layer.id}
                checked={activeLayers.includes(layer.id)}
                onChange={() => onLayerToggle(layer.id)}
                className="mt-1 mr-2.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={layer.id} className="text-sm text-gray-700 leading-tight cursor-pointer">
                {layer.name}
              </label>
              {layer.id === 'veje' && activeLayers.includes('veje') && (
                <VejtemaLegend />
              )}
            </div>
          ))}


          {/* Route legend */}
          {routeInfo.isVisible && routeInfo.points.length > 0 && (
            <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
              <div className="w-6 h-0.5 bg-blue-600 mr-2"></div>
              <span className="text-sm text-gray-700">Beregnet rute</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayerControl;