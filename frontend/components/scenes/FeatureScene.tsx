'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const P600 = '#4f46e5';
const P500 = '#6366f1';
const P400 = '#818cf8';
const P300 = '#a5b4fc';
const P200 = '#c7d2fe';

// ── AI Processing ─────────────────────────────────────────────────────────
function AIMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.42;
      ref.current.rotation.x = s.clock.elapsedTime * 0.19;
    }
  });
  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color={P600} wireframe transparent opacity={0.85} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={P600} emissive={P600} emissiveIntensity={0.7} />
      </mesh>
    </Float>
  );
}

// ── API Integration ───────────────────────────────────────────────────────
function APIMesh() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.35;
  });
  return (
    <Float speed={1.8} floatIntensity={0.25}>
      <group ref={ref}>
        <mesh position={[-0.58, 0, 0]}>
          <boxGeometry args={[0.38, 0.38, 0.38]} />
          <meshStandardMaterial color={P600} />
        </mesh>
        <mesh position={[0.58, 0, 0]}>
          <boxGeometry args={[0.38, 0.38, 0.38]} />
          <meshStandardMaterial color={P500} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color={P300} />
        </mesh>
        {/* Horizontal connector */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 1.16, 8]} />
          <meshStandardMaterial color={P200} transparent opacity={0.7} />
        </mesh>
        {/* Vertical connector (left to top) */}
        <mesh position={[-0.29, 0.29, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.022, 0.022, 0.82, 8]} />
          <meshStandardMaterial color={P200} transparent opacity={0.55} />
        </mesh>
      </group>
    </Float>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────
const BARS = [
  { h: 0.45, x: -0.68, color: P200 },
  { h: 0.78, x: -0.34, color: P300 },
  { h: 1.15, x: 0.0,  color: P600 },
  { h: 0.88, x: 0.34, color: P400 },
  { h: 0.58, x: 0.68, color: P300 },
];

function AnalyticsMesh() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.28;
  });
  return (
    <Float speed={1.6} floatIntensity={0.2}>
      <group ref={ref}>
        {BARS.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2 - 0.52, 0]}>
            <boxGeometry args={[0.22, b.h, 0.22]} />
            <meshStandardMaterial color={b.color} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// ── Secure ────────────────────────────────────────────────────────────────
function SecureMesh() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.32;
      ref.current.rotation.x = s.clock.elapsedTime * 0.12;
    }
  });
  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={P600}
          transparent
          opacity={0.88}
          roughness={0.15}
          metalness={0.65}
        />
      </mesh>
    </Float>
  );
}

export type FeatureType = 'ai' | 'api' | 'analytics' | 'secure';

const SCENES: Record<FeatureType, React.ComponentType> = {
  ai: AIMesh,
  api: APIMesh,
  analytics: AnalyticsMesh,
  secure: SecureMesh,
};

interface FeatureSceneProps {
  feature: FeatureType;
}

export default function FeatureScene({ feature }: FeatureSceneProps) {
  const Scene = SCENES[feature];
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.9} />
      <pointLight position={[3, 3, 3]} intensity={1.1} />
      <Scene />
    </Canvas>
  );
}
