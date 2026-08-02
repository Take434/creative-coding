import paper from "paper";
import { useEffect, useRef, useState } from "react";
import { content } from "./description";
import { ProjectDescription } from "@/components/project-description/project-description";

type Size = {
  width: number;
  height: number;
};

const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export function Zeichen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const scope = new paper.PaperScope();
    scope.setup(canvas);
    scope.view.viewSize = new scope.Size(size.width, size.height);

    const width = size.width;
    const height = size.height;

    new scope.Path.Rectangle({
      from: [0, 0],
      to: [width, height],
      fillColor: "#24323f",
    });

    const glow = new scope.Path.Circle({
      center: [width * 0.35, height * 0.55],
      radius: Math.max(width, height) * 0.5,
      fillColor: "rgba(170, 190, 205, 0.12)",
    });
    glow.scale(1.25, 0.85);

    const textSvg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="780" height="220" viewBox="0 0 780 220">',
      '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"',
      'font-family="Georgia, Times New Roman, serif" font-size="160" font-weight="700" letter-spacing="10"',
      'fill="rgba(180, 198, 210, 0.28)" stroke="rgba(20, 26, 30, 0.95)" stroke-width="5">Zeichen</text>',
      "</svg>",
    ].join(" ");

    const hiddenText = scope.project.importSVG(textSvg) as paper.Item;

    const targetWidth = Math.min(width * 0.56, Math.max(280, width * 0.42));
    const widthScale = targetWidth / hiddenText.bounds.width;
    hiddenText.scale(widthScale);

    const edgePadding = 20;
    const halfTextWidth = hiddenText.bounds.width * 0.5;
    const halfTextHeight = hiddenText.bounds.height * 0.5;

    const minX = halfTextWidth + edgePadding;
    const maxX = width - halfTextWidth - edgePadding;
    const minY = halfTextHeight + edgePadding;
    const maxY = height - halfTextHeight - edgePadding;

    const textX =
      minX < maxX ? randomBetween(minX, maxX) : Math.max(minX, width * 0.5);
    const textY =
      minY < maxY ? randomBetween(minY, maxY) : Math.max(minY, height * 0.5);

    hiddenText.position = new scope.Point(textX, textY);
    hiddenText.opacity = 0.9;

    return () => {
      const project = scope.project;
      const view = scope.view;

      project?.remove();
      view?.remove();
    };
  }, [size.height, size.width]);

  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas) {
      return;
    }

    const width = size.width;
    const height = size.height;
    const dpr = window.devicePixelRatio || 1;

    fogCanvas.width = Math.floor(width * dpr);
    fogCanvas.height = Math.floor(height * dpr);

    const fogCtx = fogCanvas.getContext("2d");
    if (!fogCtx) {
      return;
    }

    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = fogCanvas.width;
    textureCanvas.height = fogCanvas.height;
    const textureCtx = textureCanvas.getContext("2d");
    if (!textureCtx) {
      return;
    }

    textureCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    textureCtx.clearRect(0, 0, width, height);
    textureCtx.fillStyle = "rgb(220, 232, 238)";
    textureCtx.fillRect(0, 0, width, height);

    const blobCount = Math.max(140, Math.floor((width * height) / 9000));
    for (let i = 0; i < blobCount; i++) {
      textureCtx.save();
      textureCtx.translate(
        randomBetween(-80, width + 80),
        randomBetween(-80, height + 80),
      );
      textureCtx.scale(randomBetween(0.7, 1.5), randomBetween(0.6, 1.35));
      const blobShade = Math.round(randomBetween(228, 252));
      textureCtx.fillStyle = `rgb(${blobShade}, ${Math.min(blobShade + 2, 255)}, 255)`;
      textureCtx.beginPath();
      textureCtx.arc(0, 0, randomBetween(18, 90), 0, Math.PI * 2);
      textureCtx.fill();
      textureCtx.restore();
    }

    const streakCount = Math.max(26, Math.floor(width / 70));
    for (let i = 0; i < streakCount; i++) {
      textureCtx.beginPath();
      textureCtx.moveTo(
        randomBetween(0, width),
        randomBetween(-30, height * 0.5),
      );
      textureCtx.lineTo(
        randomBetween(0, width),
        randomBetween(height * 0.35, height + 40),
      );
      const streakShade = Math.round(randomBetween(230, 248));
      textureCtx.strokeStyle = `rgb(${streakShade}, ${Math.min(streakShade + 4, 255)}, 255)`;
      textureCtx.lineWidth = randomBetween(1, 3.5);
      textureCtx.lineCap = "round";
      textureCtx.stroke();
    }

    type Mark = {
      points: Array<{ x: number; y: number }>;
      life: number;
    };

    const marks: Mark[] = [];
    const refogSeconds = 20;
    const eraseRadius = Math.max(24, Math.min(width, height) * 0.04);
    let activeMark: Mark | null = null;
    let isPointerDown = false;
    let rafId = 0;
    let lastTs = performance.now();

    const toLocalPoint = (event: PointerEvent) => {
      const rect = fogCanvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const addDot = (x: number, y: number) => {
      marks.push({ points: [{ x, y }], life: refogSeconds });
    };

    const startStroke = (x: number, y: number) => {
      activeMark = { points: [{ x, y }], life: refogSeconds };
      marks.push(activeMark);
    };

    const onPointerDown = (event: PointerEvent) => {
      isPointerDown = true;
      fogCanvas.setPointerCapture(event.pointerId);
      const point = toLocalPoint(event);
      addDot(point.x, point.y);
      startStroke(point.x, point.y);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isPointerDown) {
        return;
      }

      const point = toLocalPoint(event);
      if (!activeMark) {
        startStroke(point.x, point.y);
        return;
      }

      const last = activeMark.points[activeMark.points.length - 1];
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(distance / (eraseRadius * 0.3)));

      for (let i = 1; i <= steps; i++) {
        activeMark.points.push({
          x: last.x + (dx * i) / steps,
          y: last.y + (dy * i) / steps,
        });
      }

      activeMark.life = refogSeconds;
    };

    const onPointerUp = () => {
      isPointerDown = false;
      activeMark = null;
    };

    const drawMarks = () => {
      fogCtx.save();
      fogCtx.globalCompositeOperation = "destination-out";

      for (const mark of marks) {
        const alpha = Math.max(0, Math.min(1, mark.life / refogSeconds));
        if (alpha <= 0) {
          continue;
        }

        fogCtx.globalAlpha = alpha;
        if (mark.points.length === 1) {
          const point = mark.points[0];
          fogCtx.beginPath();
          fogCtx.arc(point.x, point.y, eraseRadius, 0, Math.PI * 2);
          fogCtx.fill();
          continue;
        }

        fogCtx.lineWidth = eraseRadius * 2;
        fogCtx.lineCap = "round";
        fogCtx.lineJoin = "round";
        fogCtx.beginPath();
        fogCtx.moveTo(mark.points[0].x, mark.points[0].y);
        for (let i = 1; i < mark.points.length; i++) {
          fogCtx.lineTo(mark.points[i].x, mark.points[i].y);
        }
        fogCtx.stroke();
      }

      fogCtx.restore();
      fogCtx.globalAlpha = 1;
    };

    const frame = (ts: number) => {
      const delta = Math.max(0, (ts - lastTs) / 1000);
      lastTs = ts;

      for (let i = marks.length - 1; i >= 0; i--) {
        marks[i].life -= delta;
        if (marks[i].life <= 0) {
          marks.splice(i, 1);
        }
      }

      fogCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fogCtx.clearRect(0, 0, width, height);
      fogCtx.drawImage(textureCanvas, 0, 0, width, height);
      drawMarks();

      rafId = window.requestAnimationFrame(frame);
    };

    fogCanvas.addEventListener("pointerdown", onPointerDown);
    fogCanvas.addEventListener("pointermove", onPointerMove);
    fogCanvas.addEventListener("pointerup", onPointerUp);
    fogCanvas.addEventListener("pointercancel", onPointerUp);
    fogCanvas.addEventListener("pointerleave", onPointerUp);

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
      fogCanvas.removeEventListener("pointerdown", onPointerDown);
      fogCanvas.removeEventListener("pointermove", onPointerMove);
      fogCanvas.removeEventListener("pointerup", onPointerUp);
      fogCanvas.removeEventListener("pointercancel", onPointerUp);
      fogCanvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [size.height, size.width]);

  return (
    <>
      <div className="relative h-[94vh] w-screen overflow-hidden bg-[#1b252f]">
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          style={{
            width: "100vw",
            height: "100vh",
            display: "block",
            touchAction: "none",
          }}
        />
        <canvas
          ref={fogCanvasRef}
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100vw",
            height: "100vh",
            display: "block",
            touchAction: "none",
          }}
        />
      </div>
      <ProjectDescription {...content} />
    </>
  );
}
