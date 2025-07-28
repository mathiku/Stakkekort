import React from 'react';

const legendItems = [
  {
    label: 'Afsluttet',
    icon: (
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          background: '#e62024', // red
          border: '1px solid #232323',
          marginRight: 8,
        }}
      />
    ),
  },
  {
    label: 'Aktiv',
    icon: (
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          background: '#0067cf', // blue
          border: '1px solid #232323',
          marginRight: 8,
        }}
      />
    ),
  },
];

export default function StakkeLegend() {
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