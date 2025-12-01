import React from 'react';

interface Props {
  color?: string;
  className?: string;
}

// Simple placeholder 3D model component used during SSR and dev when the real
// WebGL/three.js implementation may not be present. Keeps imports stable.
export default function NebuModel3D({ color = '#4ECDC4', className = '' }: Props) {
  return (
    <div className={`w-full h-64 flex items-center justify-center ${className}`}>
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="160" rx="24" fill="#FAFAFA" />
        <circle cx="80" cy="70" r="36" fill={color} opacity="0.95" />
        <ellipse cx="80" cy="116" rx="44" ry="8" fill="#000" opacity="0.08" />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#ffffff">Nebu 3D</text>
      </svg>
    </div>
  );
}
