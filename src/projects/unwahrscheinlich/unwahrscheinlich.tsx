import { Canvas, useFrame } from "@react-three/fiber";
import { unwahrschVertShader } from "./unwahrschVertShader";
import { PerspectiveCamera } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import {
  DoubleSide,
  MeshBasicMaterial,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { Slider } from "radix-ui";
import { useState } from "react";

export function Unwahrscheinlich() {
  const [roughness, setRoughness] = useState(10);
  const [speed, setSpeed] = useState(1);

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
        <Wrapper speed={speed} roughness={roughness} />
      </Canvas>
      <div className="w-[20vw] flex flex-col gap-5">
        <div className="flex flex-col mx-auto gap-2">
          <p>Roughness</p>
          <Slider.Root
            className="SliderRoot w-full"
            defaultValue={[10]}
            max={80}
            min={1}
            step={0.5}
            onValueChange={(x) => setRoughness(x[0])}
          >
            <Slider.Track className="SliderTrack">
              <Slider.Range className="SliderRange" />
            </Slider.Track>
            <Slider.Thumb className="SliderThumb" aria-label="Volume" />
          </Slider.Root>
        </div>
        <div className="flex flex-col mx-auto gap-2">
          <p>Speed</p>
          <Slider.Root
            className="SliderRoot w-full"
            defaultValue={[1]}
            max={10}
            min={1}
            step={0.1}
            onValueChange={(x) => setSpeed(x[0])}
          >
            <Slider.Track className="SliderTrack">
              <Slider.Range className="SliderRange" />
            </Slider.Track>
            <Slider.Thumb className="SliderThumb" aria-label="Volume" />
          </Slider.Root>
        </div>
        <div className="flex flex-col mx-auto">
          <p className="text-xl">Camera Controls</p>
          <hr />
          <p>Left Mouse - Hold: rotate</p>
          <p>Right Mouse - Hold: translate</p>
          <p>Mouse Wheel - Scroll: Zoom</p>
          <p>Mouse Wheel - Hold: Stronger Zoom</p>
        </div>
      </div>
    </div>
  );
}

function Wrapper({ speed, roughness }: { speed: number; roughness: number }) {
  const material = new MeshBasicMaterial();
  material.side = DoubleSide;
  material.wireframe = true;
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.u_time = { value: 1.0 };
    shader.uniforms.u_roughness = { value: roughness };
    shader.vertexShader = unwahrschVertShader;

    material.userData.shader = shader;
  };

  useFrame((state) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shader = (state.scene.getObjectByName("plane") as any)!.material
      .userData.shader;

    if (!shader) return;
    shader.uniforms.u_time.value = (performance.now() / 1000) * speed;
    shader.uniforms.u_roughness.value = roughness;
  });

  return (
    <mesh name="plane" rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[16, 16, 128, 128]} />
    </mesh>
  );
}
