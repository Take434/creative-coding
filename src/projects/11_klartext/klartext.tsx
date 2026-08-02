import { useEffect, useRef, useState } from "react";
import paper from "paper";
import { ProjectDescription } from "@/components/project-description/project-description";
import { content } from "./description";

interface Particle {
  point: paper.Point;
  velocity: paper.Point;
  target: paper.Point | null;
  circle: paper.Path.Circle;
  noiseOffset: number;
  originalTarget: paper.Point | null;
}

export function Klartext() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("SMOKE");
  const particlesRef = useRef<Particle[]>([]);
  const textPointsRef = useRef<paper.Point[]>([]);
  const isFormingRef = useRef(false);
  const timeRef = useRef(0);
  const paperScopeRef = useRef<paper.PaperScope | null>(null);
  const ensureParticleCountRef = useRef<((count: number) => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scope = new paper.PaperScope();
    scope.setup(canvas);
    paperScopeRef.current = scope;

    const baseParticleCount = 500;
    const particles: Particle[] = [];

    const createParticle = (x?: number, y?: number): Particle => {
      const px = x ?? Math.random() * scope.view.size.width;
      const py = y ?? Math.random() * scope.view.size.height;
      const circle = new scope.Path.Circle({
        center: [px, py],
        radius: Math.random() * 2 + 1,
        fillColor: new scope.Color(1, 1, 1, Math.random() * 0.5 + 0.2),
      });

      return {
        point: new scope.Point(px, py),
        velocity: new scope.Point(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ),
        target: null,
        circle,
        noiseOffset: Math.random() * 1000,
        originalTarget: null,
      };
    };

    for (let i = 0; i < baseParticleCount; i++) {
      particles.push(createParticle());
    }

    particlesRef.current = particles;

    const ensureParticleCount = (neededCount: number) => {
      const targetCount = Math.max(neededCount, baseParticleCount);
      const currentCount = particles.length;

      if (targetCount > currentCount) {
        const toAdd = targetCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
          particles.push(createParticle());
        }
      } else if (targetCount < currentCount) {
        const toRemove = currentCount - targetCount;
        for (let i = 0; i < toRemove; i++) {
          const particle = particles.pop();
          if (particle) {
            particle.circle.remove();
          }
        }
      }
      particlesRef.current = particles;
    };
    ensureParticleCountRef.current = ensureParticleCount;

    const noise = (x: number, y: number, z: number): number => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      return (Math.sin(X * 12.9898 + Y * 78.233 + Z * 37.719) * 43758.5453) % 1;
    };

    const getTextPoints = (inputText: string): paper.Point[] => {
      const points: paper.Point[] = [];
      if (!inputText.trim()) return points;

      const textItem = new scope.PointText({
        point: [scope.view.center.x, scope.view.center.y],
        content: inputText.toUpperCase(),
        fillColor: "white",
        fontFamily: "Arial Black, sans-serif",
        fontWeight: "bold",
        fontSize: Math.min(
          scope.view.size.width / (inputText.length * 0.8),
          150,
        ),
        justification: "center",
      });

      textItem.remove();

      const tempText = new scope.PointText({
        point: [scope.view.center.x, scope.view.center.y],
        content: inputText.toUpperCase(),
        fillColor: "white",
        fontFamily: "Arial Black, sans-serif",
        fontWeight: "bold",
        fontSize: Math.min(
          scope.view.size.width / (inputText.length * 0.8),
          150,
        ),
        justification: "center",
      });

      const bounds = tempText.bounds;
      const density = 4;

      const offCanvas = document.createElement("canvas");
      offCanvas.width = scope.view.size.width;
      offCanvas.height = scope.view.size.height;
      const ctx = offCanvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.min(scope.view.size.width / (inputText.length * 0.8), 150)}px Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        inputText.toUpperCase(),
        scope.view.center.x,
        scope.view.center.y,
      );

      tempText.remove();

      for (let x = bounds.left; x < bounds.right; x += density) {
        for (let y = bounds.top; y < bounds.bottom; y += density) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          if (pixel[3] > 128) {
            points.push(new scope.Point(x, y));
          }
        }
      }

      return points;
    };

    const updateTextPoints = () => {
      textPointsRef.current = getTextPoints(text);
    };

    updateTextPoints();

    let formTimer = 0;
    const formInterval = 180;
    const formDuration = 120;
    let formPhase = 0;

    scope.view.onFrame = (event: { delta: number }) => {
      timeRef.current += event.delta;
      formTimer++;

      const textPoints = textPointsRef.current;

      if (formPhase === 0 && formTimer > formInterval) {
        formPhase = 1;
        formTimer = 0;
        isFormingRef.current = true;

        if (textPoints.length > 0) {
          ensureParticleCount(textPoints.length);
        }

        particles.forEach((p, i) => {
          if (textPoints.length > 0) {
            const targetIndex = i % textPoints.length;
            p.target = textPoints[targetIndex].clone();
            p.originalTarget = p.target.clone();
          } else {
            p.target = null;
            p.originalTarget = null;
          }
        });
      } else if (formPhase === 1 && formTimer > 60) {
        formPhase = 2;
        formTimer = 0;
      } else if (formPhase === 2 && formTimer > formDuration) {
        formPhase = 0;
        formTimer = 0;
        isFormingRef.current = false;
        particles.forEach((p) => {
          p.target = null;
          p.originalTarget = null;
        });
      }

      particles.forEach((p) => {
        const t = timeRef.current;

        if (p.target && (formPhase === 1 || formPhase === 2)) {
          const diff = p.target.subtract(p.point);
          const dist = diff.length;

          if (formPhase === 1) {
            const force = diff.normalize().multiply(Math.min(dist * 0.08, 3));
            p.velocity = p.velocity.add(force).multiply(0.92);
          } else {
            const wobbleX = noise(p.noiseOffset + t * 0.5, 0, 0) * 2 - 1;
            const wobbleY = noise(0, p.noiseOffset + t * 0.5, 0) * 2 - 1;
            const wobble = new scope.Point(wobbleX, wobbleY).multiply(0.5);

            const force = diff.normalize().multiply(dist * 0.1);
            p.velocity = p.velocity.add(force).add(wobble).multiply(0.9);
          }
        } else {
          const noiseScale = 0.003;
          const noiseX =
            noise(
              p.point.x * noiseScale + t * 0.2,
              p.point.y * noiseScale,
              p.noiseOffset,
            ) *
              2 -
            1;
          const noiseY =
            noise(
              p.point.x * noiseScale,
              p.point.y * noiseScale + t * 0.2,
              p.noiseOffset + 100,
            ) *
              2 -
            1;

          const noiseForce = new scope.Point(noiseX, noiseY).multiply(0.3);
          const upwardForce = new scope.Point(0, -0.1);

          p.velocity = p.velocity
            .add(noiseForce)
            .add(upwardForce)
            .multiply(0.98);

          if (p.velocity.length > 2) {
            p.velocity = p.velocity.normalize().multiply(2);
          }
        }

        p.point = p.point.add(p.velocity);

        const margin = 50;
        if (p.point.x < -margin) p.point.x = scope.view.size.width + margin;
        if (p.point.x > scope.view.size.width + margin) p.point.x = -margin;
        if (p.point.y < -margin) p.point.y = scope.view.size.height + margin;
        if (p.point.y > scope.view.size.height + margin) p.point.y = -margin;

        p.circle.position = p.point;

        const baseOpacity = formPhase === 2 ? 0.6 : 0.3;
        const opacityVariation = noise(p.noiseOffset + t, 0, 0) * 0.2;
        (p.circle.fillColor as paper.Color).alpha =
          baseOpacity + opacityVariation;
      });
    };

    const handleResize = () => {
      scope.view.viewSize = new scope.Size(
        window.innerWidth,
        window.innerHeight,
      );
      updateTextPoints();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scope.project.clear();
    };
  }, []);

  useEffect(() => {
    if (!paperScopeRef.current) return;

    const scope = paperScopeRef.current;

    const getTextPoints = (inputText: string): paper.Point[] => {
      const points: paper.Point[] = [];
      if (!inputText.trim()) return points;

      const tempText = new scope.PointText({
        point: [scope.view.center.x, scope.view.center.y],
        content: inputText.toUpperCase(),
        fillColor: "white",
        fontFamily: "Arial Black, sans-serif",
        fontWeight: "bold",
        fontSize: Math.min(
          scope.view.size.width / (inputText.length * 0.8),
          150,
        ),
        justification: "center",
      });

      const bounds = tempText.bounds;
      const density = 4;

      const offCanvas = document.createElement("canvas");
      offCanvas.width = scope.view.size.width;
      offCanvas.height = scope.view.size.height;
      const ctx = offCanvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.font = `bold ${Math.min(scope.view.size.width / (inputText.length * 0.8), 150)}px Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        inputText.toUpperCase(),
        scope.view.center.x,
        scope.view.center.y,
      );

      tempText.remove();

      for (let x = bounds.left; x < bounds.right; x += density) {
        for (let y = bounds.top; y < bounds.bottom; y += density) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          if (pixel[3] > 128) {
            points.push(new scope.Point(x, y));
          }
        }
      }

      return points;
    };

    const points = getTextPoints(text);
    textPointsRef.current = points;

    if (ensureParticleCountRef.current && points.length > 0) {
      ensureParticleCountRef.current(points.length);
    }
  }, [text]);

  return (
    <>
      <div className="relative w-screen h-[94vh] bg-black overflow-hidden">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/50 border border-white/30 text-white text-center text-lg rounded-lg backdrop-blur-sm focus:outline-none focus:border-white/60 w-64"
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: "100vw", height: "100vh" }}
          width={typeof window !== "undefined" ? window.innerWidth : 1920}
          height={typeof window !== "undefined" ? window.innerHeight : 1080}
        />
      </div>
      <ProjectDescription {...content} />
    </>
  );
}
