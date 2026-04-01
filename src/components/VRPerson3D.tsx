// @ts-nocheck
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';

function VRGlasses() {
  return (
    <group position={[0, 0.05, 0.38]}>
      {/* Main visor band */}
      <mesh>
        <boxGeometry args={[0.52, 0.16, 0.14]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left lens glow */}
      <mesh position={[-0.14, 0, 0.06]}>
        <boxGeometry args={[0.18, 0.1, 0.04]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
      </mesh>
      {/* Right lens glow */}
      <mesh position={[0.14, 0, 0.06]}>
        <boxGeometry args={[0.18, 0.1, 0.04]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
      </mesh>
      {/* Strap left */}
      <mesh position={[-0.28, 0, -0.02]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Strap right */}
      <mesh position={[0.28, 0, -0.02]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function Head({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!group.current) return;
    const targetY = mouseRef.current.x * 0.6;
    const targetX = -mouseRef.current.y * 0.35;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.08;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.08;
  });

  return (
    <group ref={group} position={[0, 0.65, 0]}>
      {/* Head sphere */}
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.6} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 0.12, -0.05]}>
        <sphereGeometry args={[0.33, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.3, -0.02, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#e8b88a" />
      </mesh>
      <mesh position={[0.3, -0.02, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#e8b88a" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, -0.14, 0.28]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#c47a5a" />
      </mesh>
      {/* VR Glasses */}
      <VRGlasses />
    </group>
  );
}

function SeatedPerson({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const bodyColor = '#6366f1';
  const pantsColor = '#1e1b4b';
  const shoeColor = '#222';

  return (
    <group position={[0, 1.95, 0.1]}>
      {/* Torso */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.28]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#f0c8a0" />
      </mesh>

      {/* Head */}
      <Head mouseRef={mouseRef} />

      {/* Left upper arm */}
      <mesh position={[-0.38, 0.22, 0.12]} rotation={[0.5, 0, 0.4]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Left forearm (resting on "desk") */}
      <mesh position={[-0.48, -0.05, 0.28]} rotation={[1.2, 0, 0.2]}>
        <capsuleGeometry args={[0.055, 0.28, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.46, -0.22, 0.38]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#f0c8a0" />
      </mesh>

      {/* Right upper arm */}
      <mesh position={[0.38, 0.22, 0.12]} rotation={[0.5, 0, -0.4]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Right forearm */}
      <mesh position={[0.48, -0.05, 0.28]} rotation={[1.2, 0, -0.2]}>
        <capsuleGeometry args={[0.055, 0.28, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.46, -0.22, 0.38]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#f0c8a0" />
      </mesh>

      {/* Left thigh (seated, horizontal-ish) */}
      <mesh position={[-0.14, -0.28, 0.18]} rotation={[1.3, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Left shin (dangling) */}
      <mesh position={[-0.14, -0.62, 0.38]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.32, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Left shoe */}
      <mesh position={[-0.14, -0.82, 0.44]}>
        <boxGeometry args={[0.14, 0.06, 0.2]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>

      {/* Right thigh */}
      <mesh position={[0.14, -0.28, 0.18]} rotation={[1.3, 0, 0]}>
        <capsuleGeometry args={[0.09, 0.35, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Right shin */}
      <mesh position={[0.14, -0.62, 0.38]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.32, 8, 16]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      {/* Right shoe */}
      <mesh position={[0.14, -0.82, 0.44]}>
        <boxGeometry args={[0.14, 0.06, 0.2]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>
    </group>
  );
}

function LaserRay({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const ref = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    const targetX = mouseRef.current.x * viewport.width * 0.5;
    const targetY = mouseRef.current.y * viewport.height * 0.5;
    const startX = 0;
    const startY = 2.65;
    const startZ = 0.55;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dz = -3;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

    ref.current.position.set(startX + dx * 0.5, startY + dy * 0.5, startZ + dz * 0.5);
    ref.current.scale.set(1, 1, length);
    ref.current.lookAt(targetX, targetY, startZ + dz);
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.015, 0.015, 1]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
    </mesh>
  );
}

function Scene({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#6366f1" />
      <pointLight position={[0, 2.6, 1]} intensity={0.3} color="#00ffff" />

      <SeatedPerson mouseRef={mouseRef} />
      <LaserRay mouseRef={mouseRef} />
    </>
  );
}

export default function VRPerson3D() {
  const mouseRef = useRef({ x: 0, y: 0 });

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  return (
    <div
      style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      onPointerMove={onPointerMove}
    >
      <Canvas
        camera={{ position: [0, 2.2, 4.5], fov: 35 }}
        style={{ background: 'transparent' }}
      >
        <Scene mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
