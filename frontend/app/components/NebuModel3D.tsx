import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import { SceneLights } from './3d/SceneLights';

// Hook simple para intersection observer
function useIntersectionObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

interface ModelProps {
  color?: string;
}

// Constantes de configuración
const MODEL_CONFIG = {
  scale: 0.65,
  position: [0, -1.8, 0] as [number, number, number],
  cameraPosition: [0, 0, 14] as [number, number, number],
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
  const { t } = useTranslation('common');
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Hook personalizado para lazy loading con Intersection Observer
  const { ref: containerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Una vez que se carga, marcar como cargado
  useEffect(() => {
    if (isIntersecting && isClient) {
      setHasLoaded(true);
    }
  }, [isIntersecting, isClient]);

  // Mostrar placeholder solo la primera vez antes de cargar
  if (!isClient || (!hasLoaded && !isIntersecting)) {
    return (
      <div ref={containerRef} className="w-full h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <LoadingSpinner size="lg" message={t('loading.model3D')} />
      </div>
    );
  }

  // Si hay error, mostrar fallback
  if (hasError) {
    return (
      <div ref={containerRef} className="w-full h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('loading.modelUnavailable')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('loading.reloadPage')}</p>
        </div>
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
        dpr={[1, 1.5]} // Reducir DPR para mejorar rendimiento
        performance={{ min: 0.5, max: 1 }} // Limitar performance máximo
        gl={{ 
          antialias: false, // Desactivar antialiasing para mejor rendimiento
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false, // Evitar problemas de contexto
        }}
        frameloop="demand" // Solo renderizar cuando sea necesario
        onCreated={({ gl }) => {
          // Manejar pérdida de contexto WebGL
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost, attempting recovery...');
          };

          const handleContextRestored = () => {
            console.log('WebGL context restored successfully');
            setHasError(false);
          };

          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
        }}
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
            enableDamping={false} // Desactivar damping para mejor rendimiento
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
