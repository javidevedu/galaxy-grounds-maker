// @ts-nocheck
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Simple VR Head (sphere + box for glasses)
function Head({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    // Animate head to look at mouse
    group.current.rotation.y = mouse.x * 0.7;
    group.current.rotation.x = mouse.y * 0.4;
  });
  return (
    <group ref={group} position={[0, 1.2, 0]}>
      {/* Head */}
      <mesh castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* VR Glasses */}
      <mesh position={[0, 0, 0.42]}>
        <boxGeometry args={[0.6, 0.18, 0.18]} />
        <meshStandardMaterial color="#00ffff" />
      </mesh>
    </group>
  );
}

// Simple body (cylinder), arms and legs (cylinders)
function Person({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.18, -1.1, 0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.7, 24]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0.18, -1.1, 0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.7, 24]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Body */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.9, 32]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.38, 0.1, 0]} rotation={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 24]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0.38, 0.1, 0]} rotation={[0, 0, -1.2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 24]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Head with VR */}
      <Head mouse={mouse} />
    </group>
  );
}

export default function VRPerson3D() {
  const mouse = { x: 0, y: 0 };
  // Track mouse movement
  function onPointerMove(e: any) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  return (
    <div style={{ width: 180, height: 220, pointerEvents: 'auto' }} onPointerMove={onPointerMove}>
      <Canvas shadows camera={{ position: [0, 1, 3.2], fov: 30 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 2]} intensity={0.7} castShadow />
        <Person mouse={mouse} />
        <PerspectiveCamera makeDefault position={[0, 1, 3.2]} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
