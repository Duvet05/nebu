import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
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

  return <primitive object={obj} scale={0.8} position={[0, -2, 0]} />;
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
      <Canvas camera={{ position: [0, 0.5, 10], fov: 40 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
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
