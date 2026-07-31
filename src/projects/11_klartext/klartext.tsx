import { useEffect, useRef, useState } from "react";
import paper from "paper";

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

    // Helper to create a particle
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

    // Create initial particles
    for (let i = 0; i < baseParticleCount; i++) {
      particles.push(createParticle());
    }

    particlesRef.current = particles;

    // Ensure we have enough particles for text (add or remove as needed)
    const ensureParticleCount = (neededCount: number) => {
      const targetCount = Math.max(neededCount, baseParticleCount);
      const currentCount = particles.length;

      if (targetCount > currentCount) {
        // Add particles
        const toAdd = targetCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
          particles.push(createParticle());
        }
      } else if (targetCount < currentCount) {
        // Remove excess particles
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

    // Simple noise function
    const noise = (x: number, y: number, z: number): number => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      return (Math.sin(X * 12.9898 + Y * 78.233 + Z * 37.719) * 43758.5453) % 1;
    };

    // Get points from text
    const getTextPoints = (inputText: string): paper.Point[] => {
      const points: paper.Point[] = [];
      if (!inputText.trim()) return points;

      // Create temporary text to sample points from
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

      // Sample points from a grid within text bounds
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

      // Create an off-screen canvas to check if points are inside the text
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

      // Sample points where text exists
      for (let x = bounds.left; x < bounds.right; x += density) {
        for (let y = bounds.top; y < bounds.bottom; y += density) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          if (pixel[3] > 128) {
            // If pixel is not transparent
            points.push(new scope.Point(x, y));
          }
        }
      }

      return points;
    };

    // Update text points
    const updateTextPoints = () => {
      textPointsRef.current = getTextPoints(text);
    };

    updateTextPoints();

    // Animation timing
    let formTimer = 0;
    const formInterval = 180; // frames between forming
    const formDuration = 120; // frames to stay formed
    let formPhase = 0; // 0 = dispersing, 1 = forming, 2 = holding

    scope.view.onFrame = (event: { delta: number }) => {
      timeRef.current += event.delta;
      formTimer++;

      const textPoints = textPointsRef.current;

      // Phase management
      if (formPhase === 0 && formTimer > formInterval) {
        // Start forming
        formPhase = 1;
        formTimer = 0;
        isFormingRef.current = true;

        // Ensure we have enough particles for all text points
        if (textPoints.length > 0) {
          ensureParticleCount(textPoints.length);
        }

        // Assign targets to particles - each text point gets at least one particle
        particles.forEach((p, i) => {
          if (textPoints.length > 0) {
            // Assign particle to corresponding text point (wraps if more particles than points)
            const targetIndex = i % textPoints.length;
            p.target = textPoints[targetIndex].clone();
            p.originalTarget = p.target.clone();
          } else {
            p.target = null;
            p.originalTarget = null;
          }
        });
      } else if (formPhase === 1 && formTimer > 60) {
        // Holding phase
        formPhase = 2;
        formTimer = 0;
      } else if (formPhase === 2 && formTimer > formDuration) {
        // Start dispersing
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
          // Move towards target with some wobble
          const diff = p.target.subtract(p.point);
          const dist = diff.length;

          if (formPhase === 1) {
            // Forming - move towards target
            const force = diff.normalize().multiply(Math.min(dist * 0.08, 3));
            p.velocity = p.velocity.add(force).multiply(0.92);
          } else {
            // Holding - gentle wobble around target
            const wobbleX = noise(p.noiseOffset + t * 0.5, 0, 0) * 2 - 1;
            const wobbleY = noise(0, p.noiseOffset + t * 0.5, 0) * 2 - 1;
            const wobble = new scope.Point(wobbleX, wobbleY).multiply(0.5);

            const force = diff.normalize().multiply(dist * 0.1);
            p.velocity = p.velocity.add(force).add(wobble).multiply(0.9);
          }
        } else {
          // Free floating smoke behavior
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

          // Limit velocity
          if (p.velocity.length > 2) {
            p.velocity = p.velocity.normalize().multiply(2);
          }
        }

        p.point = p.point.add(p.velocity);

        // Wrap around screen
        const margin = 50;
        if (p.point.x < -margin) p.point.x = scope.view.size.width + margin;
        if (p.point.x > scope.view.size.width + margin) p.point.x = -margin;
        if (p.point.y < -margin) p.point.y = scope.view.size.height + margin;
        if (p.point.y > scope.view.size.height + margin) p.point.y = -margin;

        p.circle.position = p.point;

        // Adjust opacity based on state
        const baseOpacity = formPhase === 2 ? 0.6 : 0.3;
        const opacityVariation = noise(p.noiseOffset + t, 0, 0) * 0.2;
        (p.circle.fillColor as paper.Color).alpha =
          baseOpacity + opacityVariation;
      });
    };

    // Handle resize
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update text points when text changes
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

    // Ensure we have enough particles ready for the text
    if (ensureParticleCountRef.current && points.length > 0) {
      ensureParticleCountRef.current(points.length);
    }
  }, [text]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
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
  );
}
