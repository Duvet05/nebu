// Configuración reutilizable de iluminación para escenas 3D

interface SceneLightsProps {
  preset?: 'default' | 'bright' | 'soft' | 'dramatic';
}

export function SceneLights({ preset = 'default' }: SceneLightsProps) {
  const lightConfigs = {
    default: {
      ambient: 0.5,
      directional1: { position: [10, 10, 5] as [number, number, number], intensity: 1 },
      directional2: { position: [-10, -10, -5] as [number, number, number], intensity: 0.5 },
      point: { position: [0, 5, 0] as [number, number, number], intensity: 0.3 },
    },
    bright: {
      ambient: 0.8,
      directional1: { position: [10, 10, 5] as [number, number, number], intensity: 1.5 },
      directional2: { position: [-10, -10, -5] as [number, number, number], intensity: 0.8 },
      point: { position: [0, 5, 0] as [number, number, number], intensity: 0.5 },
    },
    soft: {
      ambient: 0.7,
      directional1: { position: [10, 10, 5] as [number, number, number], intensity: 0.6 },
      directional2: { position: [-10, -10, -5] as [number, number, number], intensity: 0.4 },
      point: { position: [0, 5, 0] as [number, number, number], intensity: 0.2 },
    },
    dramatic: {
      ambient: 0.2,
      directional1: { position: [10, 10, 5] as [number, number, number], intensity: 2 },
      directional2: { position: [-10, -10, -5] as [number, number, number], intensity: 0.2 },
      point: { position: [0, 5, 0] as [number, number, number], intensity: 0.1 },
    },
  };

  const config = lightConfigs[preset];

  return (
    <>
      <ambientLight intensity={config.ambient} />
      <directionalLight 
        position={config.directional1.position} 
        intensity={config.directional1.intensity} 
        castShadow 
      />
      <directionalLight 
        position={config.directional2.position} 
        intensity={config.directional2.intensity} 
      />
      <pointLight 
        position={config.point.position} 
        intensity={config.point.intensity} 
      />
    </>
  );
}
