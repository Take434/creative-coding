import { farbfleckFragShader } from "@/projects/farbfleck/fragmentshader";
import { Canvas, useFrame } from "@react-three/fiber";
import { converter, type Oklch, random, type Rgb } from "culori";
import { useMemo, useRef, useState } from "react";
import { Vector2, Vector3 } from "three";
import {
  ColorPicker,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/kibo-ui/color-picker";
import { Button } from "@/components/ui/button";

const vertex = `
void main() {
    gl_Position = vec4( position, 1 );
}
`;

type Colors = [Rgb, Rgb, Rgb, Rgb, Rgb, Rgb, Rgb, Rgb];

export function Farbfleck() {
  const rands = (): Colors => {
    return [
      random(),
      random(),
      random(),
      random(),
      random(),
      random(),
      random(),
      random(),
    ];
  };

  const [colors, setColors] = useState<Colors>(rands);

  const fillRandom = () => {
    setColors(rands());
  };

  const generatePalette = (primary: Rgb) => {
    const lch = converter("oklch")(primary);
    const monoton = generateMonotonSwatches(lch, 8);

    const conv = converter("rgb");
    setColors(monoton.map((x) => conv(x)) as Colors);
  };

  const generateMonotonSwatches = (color: Oklch, count: number): Oklch[] => {
    //to keep it interesting, we limit the values of the lightness between 0.05 and 0.95 thats why we only divide 90 not 100
    const stepSize = 0.9 / count;
    const mediumCol: Oklch = { ...color, l: 0.5 };
    const darker: Oklch[] = [];
    const lighter: Oklch[] = [];

    for (let i = 0; i < count / 2; i++) {
      const prev = i > 0 ? lighter[i - 1] : mediumCol;
      lighter[i] = { ...prev, l: prev.l + stepSize };
    }

    for (let i = 0; i < count / 2; i++) {
      const prev = i > 0 ? darker[i - 1] : mediumCol;
      darker[i] = { ...prev, l: prev.l - stepSize };
    }

    darker.reverse();
    let steps = [...darker, mediumCol, ...lighter];
    steps.reverse();
    steps = steps.slice(0, count);
    return steps as Oklch[];
  };

  return (
    <div className="h-full flex">
      <Canvas style={{ height: "80vh", aspectRatio: 1 / 1, width: "auto" }}>
        <ambientLight intensity={1} />
        <Shader colors={colors} />
      </Canvas>
      <div className="h-[80vh] ml-2">
        {colors.map((x, i) => (
          <div
            className="h-[10vh] aspect-square"
            style={{
              backgroundColor: `rgb(${x.r * 255} ${x.g * 255} ${x.b * 255})`,
            }}
            key={i}
          ></div>
        ))}
      </div>
      <div className="ml-6 flex flex-col">
        <h2 className="text-2xl font-bold">Custom Monoton Palette</h2>
        <div>
          <ColorPicker
            className="max-w-sm rounded-md border bg-background p-4 shadow-sm mt-2"
            onChange={(x) => {
              const y = x as [number, number, number];

              generatePalette({
                r: y[0] / 255.0,
                g: y[1] / 255.0,
                b: y[2] / 255.0,
                mode: "rgb",
              } as Rgb);
            }}
          >
            <ColorPickerSelection className="aspect-square" />
            <div className="flex items-center gap-4">
              <ColorPickerEyeDropper />
              <div className="grid w-full gap-1">
                <ColorPickerHue />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ColorPickerOutput />
              <ColorPickerFormat />
            </div>
          </ColorPicker>
        </div>
        <hr className="my-5" />
        <h2 className="text-2xl font-bold">Generate Random Colors</h2>
        <Button className="mt-2" onClick={() => fillRandom()}>
          Generate
        </Button>
      </div>
    </div>
  );
}

function Shader({ colors }: { colors: Colors }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderRef = useRef<any>(null!);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 1.0 },
      u_resolution: { value: new Vector2() },
      u_colors: {
        value: colors.map((x) => new Vector3(x.r, x.g, x.b)),
      },
    }),
    [colors],
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
