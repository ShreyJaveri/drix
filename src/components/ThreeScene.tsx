"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Icosahedron,
  Torus, 
  Sphere,
  MeshTransmissionMaterial
} from "@react-three/drei";
import * as THREE from "three";

export function ThreeScene() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* 1. STUDIO LIGHTING (For Reliability/Realism) */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1000} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={500} color="#a78bfa" />
        
        {/* 2. FLOATING OBJECTS GROUP */}
        <FloatingGroup />

        {/* 3. ENVIRONMENT & POST-FX */}
        <Environment preset="city" />
        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4} color="#a78bfa" />
      </Canvas>
    </div>
  );
}

function FloatingGroup() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      // Gentle rotation for the whole group
      group.current.rotation.y = Math.sin(t / 4) / 4;
      group.current.rotation.x = Math.cos(t / 4) / 4;
      group.current.position.y = Math.sin(t / 2) / 8;
    }
  });

  return (
    <group ref={group}>
      {/* CENTRAL CORE: Frosted Glass Icosahedron */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron args={[1.5, 0]} position={[0, 0, 0]}>
           {/* The "Expensive Glass" Material */}
           <MeshTransmissionMaterial 
              backside
              samples={4}
              thickness={2}
              chromaticAberration={0.2}
              anisotropy={1}
              distortion={0.5}
              distortionScale={0.5}
              temporalDistortion={0.2}
              iridescence={1}
              iridescenceIOR={1}
              iridescenceThicknessRange={[0, 1400]}
              roughness={0.1}
              color="#ffffff"
           />
        </Icosahedron>
      </Float>

      {/* ORBITING RINGS: Metallic Tech feel */}
      <Float speed={4} rotationIntensity={2} floatIntensity={0.5}>
        <Torus args={[2.8, 0.1, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
           <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} emissive="#4c1d95" />
        </Torus>
      </Float>

      <Float speed={3} rotationIntensity={1.5} floatIntensity={0.5}>
         <Torus args={[3.5, 0.05, 16, 100]} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
            <meshStandardMaterial color="#c4b5fd" metalness={1} roughness={0.1} />
         </Torus>
      </Float>

      {/* SATELLITE SPHERES: Floating "Data" points */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.3, 32, 32]} position={[3, 2, -2]}>
          <meshStandardMaterial color="#a78bfa" roughness={0.1} metalness={0.8} />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.2, 32, 32]} position={[-3, -1, 1]}>
          <meshStandardMaterial color="#ddd6fe" roughness={0.1} metalness={0.8} />
        </Sphere>
      </Float>
      
      {/* Background Particles (Subtle) */}
      <Stars />
    </group>
  );
}

// Reuse the particle field but push it back
function Stars() {
    // ... (Keep the simple particle logic from before if desired, or leave empty for cleaner look)
    // For "Reliable", less visual noise is often better. Let's keep it clean.
    return null;
}