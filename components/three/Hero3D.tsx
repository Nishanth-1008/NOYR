'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function PedestalRing() {
  const ref = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.65 + Math.sin(clock.elapsedTime * 1.8) * 0.25;
    if (innerRef.current) {
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(clock.elapsedTime * 2.4 + 1) * 0.1;
    }
  });
  return (
    <group position={[0, -2.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[2.7, 0.07, 16, 140]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh ref={innerRef}>
        <torusGeometry args={[2.1, 0.025, 12, 100]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.25} />
      </mesh>
      {/* glow disc */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[2.7, 80]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function CrystalShards() {
  const group = useRef<THREE.Group>(null);
  const shards = useMemo(() =>
    Array.from({ length: 28 }).map((_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const r = 2.5 + Math.random() * 1.1;
      return {
        pos: [Math.cos(angle) * r, (Math.random() - 0.5) * 3, Math.sin(angle) * r] as [number,number,number],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number,number,number],
        scale: 0.05 + Math.random() * 0.12,
        color: i % 8 === 0 ? '#330000' : '#0d0d0d',
      };
    }), []);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.07;
  });

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={s.color} metalness={0.98} roughness={0.02} transparent opacity={0.55} envMapIntensity={4} />
        </mesh>
      ))}
    </group>
  );
}

function HoodieMockup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.04;
    }
  });

  return (
    <Float speed={0.7} rotationIntensity={0.12} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0.4, 0]} scale={1.8}>
        {/* Torso */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.7, 0.6, 1.4, 10]} />
          <meshPhysicalMaterial
            color="#070707"
            roughness={0.22}
            metalness={0.9}
            envMapIntensity={3.5}
            clearcoat={0.25}
          />
        </mesh>
        
        {/* Kangaroo Pocket */}
        <mesh position={[0, -0.45, 0.53]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.42, 0.26, 0.12]} />
          <meshPhysicalMaterial
            color="#040404"
            roughness={0.28}
            metalness={0.8}
            envMapIntensity={3}
          />
        </mesh>

        {/* Neck Opening */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.1, 10]} />
          <meshPhysicalMaterial
            color="#080808"
            roughness={0.2}
            metalness={0.9}
            envMapIntensity={3}
          />
        </mesh>

        {/* Hood */}
        <mesh position={[0, 0.8, -0.1]} rotation={[0.08, 0, 0]}>
          <sphereGeometry args={[0.38, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
          <meshPhysicalMaterial
            color="#050505"
            roughness={0.2}
            metalness={0.92}
            envMapIntensity={4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Left Sleeve */}
        <mesh position={[-0.72, 0.1, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.2, 0.15, 1.0, 10]} />
          <meshPhysicalMaterial
            color="#070707"
            roughness={0.22}
            metalness={0.9}
            envMapIntensity={3.5}
          />
        </mesh>

        {/* Right Sleeve */}
        <mesh position={[0.72, 0.1, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.2, 0.15, 1.0, 10]} />
          <meshPhysicalMaterial
            color="#070707"
            roughness={0.22}
            metalness={0.9}
            envMapIntensity={3.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Particles() {
  const count = 350;
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 2.0;
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.04; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.014} color="#666666" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={['#000000', 10, 35]} />
      <ambientLight intensity={0.04} />
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#cccccc" />
      <directionalLight position={[-7, 2, -5]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[5, -3, 4]} intensity={0.15} color="#ff1100" />
      <pointLight position={[0, -2.5, 0]} intensity={2.5} color="#ffffff" distance={7} decay={2} />
      <pointLight position={[0, 0, 3.5]} intensity={0.5} color="#cc1100" distance={9} decay={2} />
      <Stars radius={70} depth={35} count={1800} factor={1.6} saturation={0} fade speed={0.25} />
      <Sparkles count={70} scale={8} size={1.2} speed={0.18} color="#ffffff" opacity={0.35} />
      <Sparkles count={18} scale={5} size={2.5} speed={0.12} color="#cc2200" opacity={0.55} />
      <HoodieMockup />
      <CrystalShards />
      <Particles />
      <PedestalRing />
      <Environment preset="night" />
    </>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7.5], fov: 50 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.75 }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
