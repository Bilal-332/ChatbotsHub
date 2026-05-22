'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Trail, Html } from '@react-three/drei';
import * as THREE from 'three';

const PRIMARY = '#00E5FF';
const ACCENT = '#7C4DFF';
const HIGHLIGHT = '#00FF9D';
const GLOW = '#FF3EC9';
const BACKGROUND = '#050611';

function ParticleRings() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create circular particles
  const particlesCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 1.5;
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.07} color={HIGHLIGHT} transparent opacity={0.95} sizeAttenuation />
      </points>
      {/* Glow Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color={HIGHLIGHT} transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[4.2, 0.015, 16, 100]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function CoreNetwork() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = t * 0.1;
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.15;
      shellRef.current.rotation.z = t * 0.1;
    }
  });

  return (
    <group>
      {/* Inner Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={PRIMARY}
          emissive={HIGHLIGHT}
          emissiveIntensity={3.2}
          wireframe
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Outer Shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={GLOW}
          emissiveIntensity={1.8}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      
      {/* Solid Center */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={BACKGROUND}
          emissive={PRIMARY}
          emissiveIntensity={1.6}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      <Html
        center
        transform
        position={[0.28, 0, 0]}
        distanceFactor={5}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            backgroundColor: 'rgba(91,108,255,0.18)',
            border: '1px solid rgba(91,108,255,0.35)',
            boxShadow: '0 0 28px rgba(91,108,255,0.45)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="ChatbotsHub icon"
          >
            <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(91,108,255,0.18)" stroke="rgba(91,108,255,0.35)" />
            <g transform="translate(4 4)" stroke="#5B6CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </g>
          </svg>
        </div>
      </Html>
    </group>
  );
}

function DataTrails() {
  return (
    <group>
      <Trail width={0.1} color={HIGHLIGHT} length={2} decay={1} attenuation={(t) => t * t}>
        <Float speed={2} rotationIntensity={0} floatIntensity={2}>
          <Sphere args={[0.05]} position={[2, 0, 0]}>
            <meshStandardMaterial color={HIGHLIGHT} emissive={HIGHLIGHT} emissiveIntensity={1.8} />
          </Sphere>
        </Float>
      </Trail>
      <Trail width={0.08} color={GLOW} length={1.5} decay={1} attenuation={(t) => t * t}>
        <Float speed={2.5} rotationIntensity={0} floatIntensity={1.5}>
          <Sphere args={[0.04]} position={[-2, 1, -1]}>
            <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.7} />
          </Sphere>
        </Float>
      </Trail>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '120%', height: '100%', marginLeft: '-10%' }}
    >
      <ambientLight intensity={0.18} />
      <pointLight position={[10, 10, 10]} intensity={2.8} color={HIGHLIGHT} />
      <pointLight position={[-8, -6, -8]} intensity={2.1} color={ACCENT} />
      <pointLight position={[0, 6, -6]} intensity={1.8} color={GLOW} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <CoreNetwork />
        <ParticleRings />
        <DataTrails />
      </Float>
    </Canvas>
  );
}
