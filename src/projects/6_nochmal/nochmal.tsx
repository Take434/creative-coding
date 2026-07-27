import paper from "paper";
import { Slider } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  drawGrammarString,
  expandGrammar,
  type GrammarRules,
} from "@/projects/6_nochmal/grammar";

type Size = {
  width: number;
  height: number;
};

export function Nochmal() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [generation, setGeneration] = useState(0);
  const [randomAngleJitter, setRandomAngleJitter] = useState(10);
  const [repetitions, setRepetitions] = useState(4);
  const axiom = "F-f-F-F";
  const rules: GrammarRules = useMemo(() => {
    return {
      F: "F-F+f+F-F",
    };
  }, []);
  const options = useMemo(() => {
    return {
      angle: 90,
      lineLength: 14,
      lineColor: "#13212e",
      lineWidth: 3,
      padding: 56,
      startAngle: 0,
      randomAngleJitter,
    };
  }, [randomAngleJitter]);

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      event.preventDefault();
      setGeneration((current) => current + 1);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scope = new paper.PaperScope();
    scope.setup(canvas);
    scope.view.viewSize = new scope.Size(size.width, size.height);

    new scope.Path.Rectangle({
      from: [0, 0],
      to: [size.width, size.height],
      fillColor: "#f6f1e8",
    });

    const expanded = expandGrammar(axiom, rules, repetitions);
    drawGrammarString(scope, expanded, options);

    return () => {
      const project = scope.project;
      const view = scope.view;

      project?.remove();
      view?.remove();
    };
  }, [size.height, size.width, axiom, rules, options, repetitions, generation]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#f6f1e8]">
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        style={{
          width: "100vw",
          height: "100vh",
          display: "block",
        }}
      />
      <div className="absolute left-5 top-5 max-w-md rounded-md bg-[#f6f1e8]/90 px-4 py-3 text-[#13212e] shadow-sm backdrop-blur-sm">
        <div className="text-sm font-semibold">L-System Grammar</div>
        <div className="mt-1 text-xs leading-5">
          <div>Axiom: {axiom}</div>
          <div>Rules:</div>
          <ul className="ml-4 list-disc">
            {Object.entries(rules).map(([key, value]) => (
              <li key={key}>
                {key} → {value}
              </li>
            ))}
          </ul>
          <div>Repetitions: {repetitions}</div>
          <div>Angle jitter: ±{options.randomAngleJitter}° per line</div>
          <div>Press Space to regenerate</div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span>Angle jitter</span>
              <span>{randomAngleJitter}°</span>
            </div>
            <Slider.Root
              className="SliderRoot w-full"
              value={[randomAngleJitter]}
              max={360}
              min={0}
              step={1}
              onValueChange={(value) => setRandomAngleJitter(value[0] ?? 0)}
            >
              <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Angle jitter" />
            </Slider.Root>
          </label>
          <label className="block text-xs font-medium">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span>Repetitions</span>
              <span>{repetitions}</span>
            </div>
            <Slider.Root
              className="SliderRoot w-full"
              value={[repetitions]}
              max={8}
              min={3}
              step={1}
              onValueChange={(value) => setRepetitions(value[0] ?? 3)}
            >
              <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Repetitions" />
            </Slider.Root>
          </label>
        </div>
      </div>
    </div>
  );
}
