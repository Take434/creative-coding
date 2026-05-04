import { Canvas, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { unwahrschVertShader } from "./unwahrschVertShader";
import { PerspectiveCamera } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader } from "three";
import perlin from "../../assets/Perlin 9 - 128x128.png";

export function Unwahrscheinlich() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<any>(null!);
  const noiseTex = useLoader(TextureLoader, perlin);

  return (
    <div className="h-full flex">
      <Canvas style={{ height: "80vh", aspectRatio: 1 / 1, width: "auto" }}>
        <PerspectiveCamera
          makeDefault
          args={[45, 1 / 1, 1, 10000]}
          position={[0, 0, 5]}
        />
        <directionalLight position={[5, 5, 5]} />
        <ambientLight intensity={0.1} />
        <OrbitControls />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 2, 64, 64]} />
          <meshStandardMaterial
            ref={shaderRef}
            onBeforeCompile={(shader) => {
              shader.uniforms.uNoise = { value: noiseTex };
              shader.uniforms.uStrength = { value: 0.8 };
              shader.vertexShader = unwahrschVertShader;
            }}
          />
        </mesh>
      </Canvas>
    </div>
  );
}
