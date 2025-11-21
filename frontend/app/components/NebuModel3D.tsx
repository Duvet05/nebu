import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

interface ModelProps {
  color?: string;
}

function NebuDinoModel({ color = "#4ECDC4" }: ModelProps) {
  // Cargar el modelo OBJ
  const obj = useLoader(OBJLoader, '/models/nebu-dino/base.obj');

  // Cargar texturas
  const diffuseMap = useTexture('/models/nebu-dino/texture_diffuse_00.png');
  const normalMap = useTexture('/models/nebu-dino/texture_normal_00.png');
  const roughnessMap = useTexture('/models/nebu-dino/texture_roughness_00.png');
  const metallicMap = useTexture('/models/nebu-dino/texture_metallic_00.png');

  // Aplicar materiales con texturas al modelo
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        metalnessMap: metallicMap,
        color: new THREE.Color(color),
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={obj} scale={0.65} position={[0, -1.8, 0]} />;
}

function LoadingPlaceholder() {
  return (
    <div className="w-full h-64 md:h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando modelo 3D...</p>
      </div>
    </div>
  );
}

export default function NebuModel3D({ color }: ModelProps) {
  const [isClient, setIsClient] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Solo cargar cuando el elemento es visible
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Empezar a cargar 50px antes de ser visible
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isClient]);

  if (!isClient || !shouldLoad) {
    return (
      <div ref={containerRef}>
        <LoadingPlaceholder />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-nebu-bg to-accent/10 shadow-inner">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 38 }}
        dpr={[1, 2]} // Limitar resolución en dispositivos de alta densidad
        performance={{ min: 0.5 }} // Reducir calidad si FPS baja
      >
        <Suspense fallback={null}>
          {/* Iluminación manual en lugar de HDR */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[0, 5, 0]} intensity={0.3} />
          
          <Stage environment={null} intensity={0.6}>
            <NebuDinoModel color={color} />
          </Stage>
          <OrbitControls
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
