import { Canvas, useFrame } from "@react-three/fiber";
import { unwahrschVertShader } from "./unwahrschVertShader";
import { PerspectiveCamera } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import {
  DoubleSide,
  MeshBasicMaterial,
  type WebGLProgramParametersWithUniforms,
} from "three";

export function Unwahrscheinlich() {
  return (
    <div className="h-full flex">
      <Canvas style={{ height: "94vh", width: "100%" }}>
        <PerspectiveCamera
          makeDefault
          args={[45, 1 / 1, 1, 10000]}
          position={[0, 0, 5]}
        />
        <directionalLight position={[5, 5, 5]} />
        <ambientLight intensity={0.1} />
        <OrbitControls />
        <Wrapper />
      </Canvas>
    </div>
  );
}

function Wrapper() {
  const material = new MeshBasicMaterial();
  material.side = DoubleSide;
  material.wireframe = true;
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.u_time = { value: 1.0 };
    shader.vertexShader = unwahrschVertShader;

    material.userData.shader = shader;
  };

  useFrame((state) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shader = (state.scene.getObjectByName("plane") as any)!.material
      .userData.shader;

    if (!shader) return;
    shader.uniforms.u_time.value = performance.now() / 1000;
  });

  return (
    <mesh name="plane" rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[16, 16, 128, 128]} />
    </mesh>
  );
}
