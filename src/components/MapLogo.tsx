import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import Logo from './Logo';
import ReactDOMServer from 'react-dom/server';

const MapLogo = () => {
  const map = useMap();

  useEffect(() => {
    // Create a custom control
    const LogoControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-control');
        container.style.margin = '0px';
        
        // Create the content with a clickable link
        container.innerHTML = ReactDOMServer.renderToString(
          <a 
            href="https://www.dalgas.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'block',
              transform: 'scale(1)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              backgroundColor: 'transparent',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <Logo style={{ 
                display: 'block',
                height: '40px',
                width: '40px'
              }} />
            </div>
          </a>
        );

        // Prevent click events from propagating to the map
        L.DomEvent.disableClickPropagation(container);
        
        // Add click handler (as backup in case the React event doesn't work)
        container.querySelector('a')?.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open('https://www.dalgas.com', '_blank', 'noopener,noreferrer');
        });
        
        return container;
      }
    });

    // Add the control to the map
    const logoControl = new LogoControl();
    map.addControl(logoControl);

    // Cleanup on unmount
    return () => {
      map.removeControl(logoControl);
    };
  }, [map]);

  return null;
};

export default MapLogo; 