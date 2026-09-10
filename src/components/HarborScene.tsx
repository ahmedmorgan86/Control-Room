"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Beacon({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.65 + Math.sin(clock.getElapsedTime() * 3) * 0.25;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Crane({ x, active = true }: { x: number; active?: boolean }) {
  return (
    <group position={[x, 0, -0.7]}>
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.16, 2.5, 0.16]} />
        <meshStandardMaterial color="#dca62d" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0.35, 2.25, 0]} rotation={[0, 0, -0.04]}>
        <boxGeometry args={[1.15, 0.12, 0.12]} />
        <meshStandardMaterial color="#f3c34d" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 1.15, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.12, 2.2, 0.12]} />
        <meshStandardMaterial color="#bd8420" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.68, 1.48, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color={active ? "#2dd4bf" : "#fb7185"} emissive={active ? "#0d9488" : "#be123c"} emissiveIntensity={1.8} />
      </mesh>
      <Beacon position={[0.68, 1.72, 0]} color={active ? "#2dd4bf" : "#fb7185"} />
    </group>
  );
}

function HarborModel() {
  const vesselRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (vesselRef.current) vesselRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.025;
  });
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} color="#b8d7ff" />
      <pointLight position={[0, 2.5, 1]} intensity={4} distance={8} color="#2dd4bf" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#071827" metalness={0.3} roughness={0.65} />
      </mesh>
      <gridHelper args={[14, 28, "#17556a", "#0e2d3c"]} position={[0, -0.12, 0]} />
      <group ref={vesselRef} position={[0, 0, 0.1]}>
        <mesh position={[0, 0.1, 0.55]} rotation={[0, Math.PI, 0]}>
          <boxGeometry args={[4.2, 0.28, 1.15]} />
          <meshStandardMaterial color="#142c3d" metalness={0.6} roughness={0.3} />
        </mesh>
        {[-1.45, -0.72, 0, 0.72, 1.45].map((x, i) => (
          <mesh key={x} position={[x, 0.38 + (i % 2) * 0.18, 0.55]}>
            <boxGeometry args={[0.62, 0.32, 0.82]} />
            <meshStandardMaterial color={["#2563eb", "#0e7490", "#e45b3b", "#059669"][i % 4]} metalness={0.2} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[1.5, 0.62, 0.55]}>
          <boxGeometry args={[0.62, 0.82, 0.82]} />
          <meshStandardMaterial color="#d8e6e9" metalness={0.15} roughness={0.5} />
        </mesh>
      </group>
      <Crane x={-3.5} />
      <Crane x={-2.1} />
      <Crane x={2.5} active={false} />
      <Crane x={3.8} />
    </>
  );
}

export function HarborScene({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      <Canvas camera={{ position: [0, 3.2, 6.2], fov: 38 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#06111b"]} />
        <HarborModel />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.28} maxPolarAngle={Math.PI / 2.05} minPolarAngle={Math.PI / 3.5} />
      </Canvas>
    </div>
  );
}

export default HarborScene;
