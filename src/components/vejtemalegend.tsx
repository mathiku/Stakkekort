// src/components/VejtemaLegend.tsx
import React from 'react';

const legendItems = [
  {
    label: 'Vendeplads',
    icon: (
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#2ecc40', // green
          marginRight: 8,
        }}
      />
    ),
  },
  {
    label: 'Lastbilvej',
    icon: (
      <svg width="20" height="16" style={{ marginRight: 8 }}>
        <line x1="2" y1="8" x2="18" y2="8" stroke="#2ecc40" strokeWidth="4" />
      </svg>
    ),
  },
  {
    label: 'Lastbilvej forbudt',
    icon: (
      <svg width="20" height="16" style={{ marginRight: 8 }}>
        <line x1="2" y1="8" x2="18" y2="8" stroke="#ff69b4" strokeWidth="4" />
      </svg>
    ),
  },
  {
    label: 'Personbilvej',
    icon: (
      <svg width="20" height="16" style={{ marginRight: 8 }}>
        <line x1="2" y1="8" x2="18" y2="8" stroke="#00e5ee" strokeWidth="4" />
      </svg>
    ),
  },
  {
    label: 'Andet',
    icon: (
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          background: '#bada55', // greenish
          marginRight: 8,
        }}
      />
    ),
  },
];

export default function VejtemaLegend() {
  return (
    <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      {legendItems.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          {item.icon}
          <span style={{ fontSize: '10px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}