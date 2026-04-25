'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const P600 = '#4f46e5';
const P500 = '#6366f1';
const P300 = '#a5b4fc';
const WHITE = '#ffffff';

// ── Step 1: Floating document ──────────────────────────────────────────────
function DocumentMesh() {
  return (
    <Float speed={2.2} floatIntensity={0.5} rotationIntensity={0.15}>
      <group rotation={[0.25, 0.4, 0.1]}>
        {/* Document body */}
        <mesh castShadow>
          <boxGeometry args={[1.35, 1.75, 0.07]} />
          <meshStandardMaterial color={WHITE} roughness={0.3} />
        </mesh>
        {/* Header bar */}
        <mesh position={[0, 0.62, 0.042]}>
          <boxGeometry args={[0.9, 0.18, 0.01]} />
          <meshStandardMaterial color={P600} />
        </mesh>
        {/* Lines */}
        {[0.33, 0.1, -0.13, -0.36, -0.59].map((y, i) => (
          <mesh key={i} position={[0, y, 0.042]}>
            <boxGeometry args={[i === 0 ? 0.7 : 0.95, 0.055, 0.01]} />
            <meshStandardMaterial color="#e0e7ff" />
          </mesh>
        ))}
        {/* Bottom accent */}
        <mesh position={[-0.35, -0.78, 0.042]}>
          <boxGeometry args={[0.25, 0.1, 0.01]} />
          <meshStandardMaterial color={P300} />
        </mesh>
      </group>
    </Float>
  );
}

// ── Step 2: AI processing neural orb ─────────────────────────────────────
function ProcessingMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.45;
    if (orbitRef.current) orbitRef.current.rotation.z = state.clock.elapsedTime * 0.6;
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe cage */}
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color={P600} wireframe transparent opacity={0.6} />
      </mesh>
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color={P600} emissive={P600} emissiveIntensity={0.7} />
      </mesh>
      {/* Orbiting nodes */}
      <group ref={orbitRef}>
        {[0, 120, 240].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={P300} emissive={P300} emissiveIntensity={0.6} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ── Step 3: API torus rings ───────────────────────────────────────────────
function ApiMesh() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.38;
      ring1Ref.current.rotation.y = t * 0.22;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.28;
      ring2Ref.current.rotation.z = t * 0.32;
    }
  });

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.0, 0.07, 8, 40]} />
        <meshStandardMaterial color={P600} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.0, 0.045, 8, 40]} />
        <meshStandardMaterial color={P500} transparent opacity={0.55} />
      </mesh>
      {/* Center node */}
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={P600} emissive={P600} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export type StepNumber = 1 | 2 | 3;

interface StepSceneProps {
  step: StepNumber;
}

export default function StepScene({ step }: StepSceneProps) {
  const Scene = step === 1 ? DocumentMesh : step === 2 ? ProcessingMesh : ApiMesh;

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 48 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.85} />
      <pointLight position={[3, 3, 3]} intensity={1.1} />
      <Scene />
    </Canvas>
  );
}
