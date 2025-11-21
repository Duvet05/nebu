import { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import { LoadingPlaceholder3D } from './LoadingSpinner';
import { useIntersectionObserver } from '~/hooks/useIntersectionObserver';
import { SceneLights } from './3d/SceneLights';

interface ModelProps {
  color?: string;
}

// Constantes de configuración
const MODEL_CONFIG = {
  scale: 0.65,
  position: [0, -1.8, 0] as [number, number, number],
  cameraPosition: [0, 0, 10] as [number, number, number],
  cameraFov: 38,
  autoRotateSpeed: 2,
} as const;

const TEXTURE_PATHS = {
  diffuse: '/models/nebu-dino/texture_diffuse_00.png',
  normal: '/models/nebu-dino/texture_normal_00.png',
  roughness: '/models/nebu-dino/texture_roughness_00.png',
  metallic: '/models/nebu-dino/texture_metallic_00.png',
} as const;

function NebuDinoModel({ color = "#4ECDC4" }: ModelProps) {
  // Cargar el modelo OBJ
  const obj = useLoader(OBJLoader, '/models/nebu-dino/base.obj');

  // Cargar texturas
  const diffuseMap = useTexture(TEXTURE_PATHS.diffuse);
  const normalMap = useTexture(TEXTURE_PATHS.normal);
  const roughnessMap = useTexture(TEXTURE_PATHS.roughness);
  const metallicMap = useTexture(TEXTURE_PATHS.metallic);

  // Memoizar el material para evitar recrearlo en cada render
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      metalnessMap: metallicMap,
      color: new THREE.Color(color),
    });
  }, [diffuseMap, normalMap, roughnessMap, metallicMap, color]);

  // Aplicar material al modelo (solo una vez)
  useEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [obj, material]);

  return (
    <primitive 
      object={obj} 
      scale={MODEL_CONFIG.scale} 
      position={MODEL_CONFIG.position} 
    />
  );
}

export default function NebuModel3D({ color }: ModelProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Hook personalizado para lazy loading con Intersection Observer
  const { ref: containerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '50px',
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mostrar placeholder hasta que sea visible y el cliente esté listo
  if (!isClient || !isIntersecting) {
    return (
      <div ref={containerRef}>
        <LoadingPlaceholder3D />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-nebu-bg to-accent/10 shadow-inner"
    >
      <Canvas
        camera={{ position: MODEL_CONFIG.cameraPosition, fov: MODEL_CONFIG.cameraFov }}
        dpr={[1, 2]} // Limitar resolución en dispositivos de alta densidad
        performance={{ min: 0.5 }} // Reducir calidad si FPS baja
      >
        <Suspense fallback={null}>
          {/* Iluminación reutilizable */}
          <SceneLights preset="default" />
          
          <Stage environment={null} intensity={0.6}>
            <NebuDinoModel color={color} />
          </Stage>
          
          <OrbitControls
            enableZoom={false}
            autoRotate
            autoRotateSpeed={MODEL_CONFIG.autoRotateSpeed}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
