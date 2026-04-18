import { useTheme } from "@/lib/states";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector2, Vector3 } from "three";
import { oklch, rgb, type Oklch } from "culori";
import { cgloFrag } from "@/components/overview/cgolshader";

const vertex = `
void main() {
    gl_Position = vec4( position, 1 );
}
`;

export function ConwaysGOL() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<any>(null!);
  const theme = useTheme((state) => state.isDark);

  useEffect(() => {
    const cssColorBG = getComputedStyle(
      document.querySelector("#root")!,
    ).getPropertyValue("--background");

    const cssColorACC = getComputedStyle(
      document.querySelector("#root")!,
    ).getPropertyValue("--foreground");

    const tempCssColorBG = cssColorBG
      .replace("oklch(", "")
      .replace(")", "")
      .split(" ")
      .map((x) => Number.parseFloat(x)) as [number, number, number];

    const tempCssColorACC = cssColorACC
      .replace("oklch(", "")
      .replace(")", "")
      .split(" ")
      .map((x) => Number.parseFloat(x)) as [number, number, number];

    const oklchBG: Oklch = {
      mode: "oklch",
      l: tempCssColorBG[0],
      c: tempCssColorBG[1],
      h: tempCssColorBG[2],
    };
    const bg = rgb(oklch(oklchBG));

    const oklchACC: Oklch = {
      mode: "oklch",
      l: tempCssColorACC[0],
      c: tempCssColorACC[1],
      h: tempCssColorACC[2],
    };
    const acc = rgb(oklch(oklchACC));

    shaderRef.current.uniforms.u_background_color.value = bg;
    shaderRef.current.uniforms.u_accent_color.value = acc;
  }, [theme]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 1.0 },
      u_resolution: { value: new Vector2() },
      u_mouse: { value: new Vector2() },
      u_background_color: { value: new Vector3() },
      u_accent_color: { value: new Vector3() },
    }),
    [],
  );

  useFrame((state) => {
    shaderRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    shaderRef.current.uniforms.u_resolution.value = new Vector2(
      state.gl.domElement.width,
      state.gl.domElement.height,
    );
    shaderRef.current.uniforms.u_mouse.value = state.pointer;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertex}
        fragmentShader={cgloFrag}
        uniforms={uniforms}
      />
    </mesh>
  );
}
