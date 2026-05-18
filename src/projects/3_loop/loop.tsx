import { loopFrag } from "@/projects/3_loop/fragmentshader";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";

const vertex = `
void main() {
    gl_Position = vec4( position, 1 );
}
`;

export function Loop() {
  return (
    <div className="h-full flex">
      <Canvas style={{ height: "94vh", aspectRatio: 1 / 1, width: "auto" }}>
        <ambientLight intensity={1} />
        <Shader />
      </Canvas>
      <div className="h-[80vh] ml-2"></div>
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
        fragmentShader={loopFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}
