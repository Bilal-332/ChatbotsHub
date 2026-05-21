'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

const PRIMARY = '#5B6CFF';
const ACCENT = '#7C4DFF';
const BACKGROUND = '#060816';

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
        <pointsMaterial size={0.05} color={PRIMARY} transparent opacity={0.6} sizeAttenuation />
      </points>
      {/* Glow Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshBasicMaterial color={PRIMARY} transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2.2, 0.1, 0]}>
        <torusGeometry args={[4.2, 0.015, 16, 100]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.2} />
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
          emissive={PRIMARY} 
          emissiveIntensity={1.5}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Outer Shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial 
          color={ACCENT} 
          wireframe 
          transparent 
          opacity={0.25} 
        />
      </mesh>
      
      {/* Solid Center */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color={BACKGROUND} emissive={PRIMARY} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </Sphere>
    </group>
  );
}

function DataTrails() {
  return (
    <group>
      <Trail width={0.1} color={PRIMARY} length={2} decay={1} attenuation={(t) => t * t}>
        <Float speed={2} rotationIntensity={0} floatIntensity={2}>
          <Sphere args={[0.05]} position={[2, 0, 0]}>
            <meshBasicMaterial color={PRIMARY} />
          </Sphere>
        </Float>
      </Trail>
      <Trail width={0.08} color={ACCENT} length={1.5} decay={1} attenuation={(t) => t * t}>
        <Float speed={2.5} rotationIntensity={0} floatIntensity={1.5}>
          <Sphere args={[0.04]} position={[-2, 1, -1]}>
            <meshBasicMaterial color={ACCENT} />
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
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={PRIMARY} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={ACCENT} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <CoreNetwork />
        <ParticleRings />
        <DataTrails />
      </Float>
    </Canvas>
  );
}
