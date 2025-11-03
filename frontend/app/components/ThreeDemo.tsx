import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Pure three.js demo (no react-three-fiber) to avoid peer dependency issues
export default function ThreeDemo() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  const mount = mountRef.current;
  if (!mount) return;

  const width = mount.clientWidth;
  const height = Math.max(400, Math.floor(window.innerHeight * 0.7));

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Scene and camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(3, 2, 5);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // Box
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x6ee7b7, metalness: 0.4, roughness: 0.2 });
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    // Ground (subtle)
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    scene.add(ground);

    let req: number;
    const clock = new THREE.Clock();

    function animate() {
      const delta = clock.getDelta();
      box.rotation.x += delta * 0.6;
      box.rotation.y += delta * 0.4;
      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    }
    animate();

    // Simple resize handler
    function handleResize() {
      const m = mountRef.current;
      if (!m) return;
      const w = m.clientWidth;
      const h = Math.max(400, Math.floor(window.innerHeight * 0.7));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="w-full h-[80vh] bg-black/5 rounded-lg shadow-md overflow-hidden">
      {!mounted && <div className="w-full h-96 flex items-center justify-center">Cargando demo 3D...</div>}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
