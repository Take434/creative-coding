import { farbfleckFragShader } from "@/projects/farbfleck/fragmentshader";
import { Canvas, useFrame } from "@react-three/fiber";
import { random } from "culori";
import { useMemo, useRef } from "react";
import { Vector2, Vector3 } from "three";

const vertex = `
void main() {
    gl_Position = vec4( position, 1 );
}
`;

const randColor = () => {
  const r = random();
  return new Vector3(r.r, r.g, r.b);
};

export function Farbfleck() {
  return (
    <div className="h-full">
      <Canvas style={{ height: "80vh", aspectRatio: 1 / 1, width: "auto" }}>
        <ambientLight intensity={1} />
        <Shader />
      </Canvas>
    </div>
  );
}

function Shader() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<any>(null!);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 1.0 },
      u_resolution: { value: new Vector2() },
      u_colors: {
        value: [
          randColor(),
          randColor(),
          randColor(),
          randColor(),
          randColor(),
          randColor(),
          randColor(),
          randColor(),
        ],
      },
    }),
    [],
  );

  useFrame((state) => {
    shaderRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    shaderRef.current.uniforms.u_resolution.value = new Vector2(
      state.gl.domElement.width,
      state.gl.domElement.height,
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertex}
        fragmentShader={farbfleckFragShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
