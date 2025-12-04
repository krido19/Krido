import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const NeonSign = ({ position, text, color, onClick }) => {
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    return (
        <group position={position} onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <Text
                fontSize={0.8}
                color={hovered ? '#ffffff' : color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor={color}
            >
                {text}
            </Text>
            {/* Glow effect backing */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[text.length * 0.6, 1.2]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
        </group>
    );
};

const ShopStructure = () => {
    return (
        <group position={[0, -2, 0]}>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Counter */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[6, 2, 2]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* Counter Top */}
            <mesh position={[0, 2.1, 0]}>
                <boxGeometry args={[6.2, 0.2, 2.2]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.2} />
            </mesh>

            {/* Pillars */}
            <mesh position={[-2.8, 3, 0]}>
                <boxGeometry args={[0.2, 4, 0.2]} />
                <meshStandardMaterial color="#ff00de" emissive="#ff00de" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[2.8, 3, 0]}>
                <boxGeometry args={[0.2, 4, 0.2]} />
                <meshStandardMaterial color="#ff00de" emissive="#ff00de" emissiveIntensity={0.5} />
            </mesh>

            {/* Roof */}
            <mesh position={[0, 5, 0]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[6.5, 0.5, 4]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, 2.5, -2]}>
                <boxGeometry args={[6, 5, 0.5]} />
                <meshStandardMaterial color="#222" />
            </mesh>
        </group>
    );
};

const FloatingCube = ({ position, color }) => {
    const mesh = useRef();
    useFrame((state, delta) => {
        mesh.current.rotation.x += delta * 0.5;
        mesh.current.rotation.y += delta * 0.5;
    });
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={mesh} position={position}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </Float>
    );
};

const Scene = () => {
    // Note: useNavigate cannot be used directly inside Canvas if Canvas is outside Router context, 
    // but here Scene is used inside Home which is inside Router. 
    // However, Canvas creates a new React root. We need to bridge the context or just use window.location for simplicity in this demo.

    const handleSignClick = () => {
        window.location.href = '/login';
    };

    return (
        <div className="fixed inset-0 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 20]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group position={[0, -1, 0]} rotation={[0, -Math.PI / 6, 0]}>
                    <ShopStructure />

                    {/* Main Signboard */}
                    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                        <NeonSign
                            position={[0, 3.5, 1]}
                            text="DEVELOPING"
                            color="#00ffff"
                            onClick={handleSignClick}
                        />
                    </Float>

                    {/* Decorative Signs */}
                    <NeonSign
                        position={[-2, 1.5, 1.2]}
                        text="OPEN"
                        color="#ff00de"
                        onClick={handleSignClick}
                    />
                    <NeonSign position={[2, 1.5, 1.2]} text="24/7" color="#ffff00" />
                </group>

                <FloatingCube position={[-4, 2, 0]} color="#00ffff" />
                <FloatingCube position={[4, 1, 0]} color="#ff00de" />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                />
            </Canvas>
        </div>
    );
};

export default Scene;
