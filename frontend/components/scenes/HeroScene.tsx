'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const P600 = '#4f46e5';
const P500 = '#6366f1';
const P300 = '#a5b4fc';
const P100 = '#c7d2fe';

const NODE_POSITIONS: [number, number, number][] = [
  [0, 0, 0],
  [2.8, 0.4, -0.6],
  [-2.6, 1.1, 0.3],
  [-2.1, -1.4, 0.9],
  [1.6, -2.3, -0.4],
  [0.4, 2.5, -1.1],
  [1.1, 0.6, 2.6],
  [-0.6, -0.9, -2.4],
];

const CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 5], [2, 5], [3, 4], [4, 6], [6, 7], [2, 3],
];

function IcosphereCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.09;
    }
  });

  return (
    <>
      {/* Wireframe icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color={P600} wireframe transparent opacity={0.55} />
      </mesh>
      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color={P600} emissive={P600} emissiveIntensity={0.8} />
      </mesh>
    </>
  );
}

function NodeNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {NODE_POSITIONS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[i === 0 ? 0 : 0.11, 8, 8]} />
          <meshStandardMaterial color={i < 3 ? P500 : P300} emissive={P500} emissiveIntensity={0.4} />
        </mesh>
      ))}

      {CONNECTIONS.map(([a, b], i) => (
        <Line
          key={i}
          points={[NODE_POSITIONS[a], NODE_POSITIONS[b]]}
          color={P100}
          lineWidth={0.6}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 48 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[6, 6, 6]} intensity={1.2} />
      <pointLight position={[-4, -3, -3]} intensity={0.4} color={P300} />

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
        <IcosphereCore />
      </Float>
      <NodeNetwork />
    </Canvas>
  );
}
