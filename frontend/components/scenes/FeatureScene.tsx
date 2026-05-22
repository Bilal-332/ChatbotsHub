'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const PRIMARY = '#00E5FF';
const ACCENT = '#7C4DFF';
const LIGHT = '#00FF9D';
const GLOW = '#FF3EC9';
const BACKGROUND = '#060816';

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
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial
          color={PRIMARY}
          emissive={PRIMARY}
          emissiveIntensity={1.4}
          wireframe
          transparent
          opacity={0.75}
        />
      </mesh>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.4} />
      </Sphere>
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
    <Float speed={1.8} floatIntensity={0.4}>
      <group ref={ref}>
        <Box args={[0.4, 0.4, 0.4]} position={[-0.6, 0, 0]}>
          <meshStandardMaterial color={PRIMARY} emissive={PRIMARY} emissiveIntensity={0.9} />
        </Box>
        <Box args={[0.4, 0.4, 0.4]} position={[0.6, 0, 0]}>
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.9} />
        </Box>
        <Box args={[0.3, 0.3, 0.3]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color={LIGHT} emissive={LIGHT} emissiveIntensity={0.8} />
        </Box>
        {/* Horizontal connector */}
        <Cylinder args={[0.03, 0.03, 1.2, 8]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={PRIMARY} emissive={PRIMARY} emissiveIntensity={0.6} transparent opacity={0.7} />
        </Cylinder>
        {/* Vertical connector (left to top) */}
        <Cylinder args={[0.02, 0.02, 0.85, 8]} position={[-0.3, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} transparent opacity={0.7} />
        </Cylinder>
      </group>
    </Float>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────
const BARS = [
  { h: 0.45, x: -0.68, color: PRIMARY },
  { h: 0.78, x: -0.34, color: ACCENT },
  { h: 1.15, x: 0.0,  color: PRIMARY },
  { h: 0.88, x: 0.34, color: LIGHT },
  { h: 0.58, x: 0.68, color: ACCENT },
];

function AnalyticsMesh() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.28;
  });
  return (
    <Float speed={1.6} floatIntensity={0.3}>
      <group ref={ref}>
        {BARS.map((b, i) => (
          <Box key={i} args={[0.22, b.h, 0.22]} position={[b.x, b.h / 2 - 0.52, 0]}>
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.8} />
          </Box>
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
    <Float speed={2} floatIntensity={0.4}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={BACKGROUND}
          emissive={PRIMARY}
          emissiveIntensity={1.2}
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.8}
          wireframe
        />
      </mesh>
      <Sphere args={[0.4, 32, 32]}>
         <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.2} roughness={0.15} metalness={0.9} />
      </Sphere>
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
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[3, 3, 3]} intensity={2.2} color={PRIMARY} />
      <pointLight position={[-3, -3, -3]} intensity={1.4} color={ACCENT} />
      <pointLight position={[0, 2, -2]} intensity={1.2} color={GLOW} />
      <Scene />
    </Canvas>
  );
}
