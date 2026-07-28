import paper from "paper";
import { Slider } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import {
  createInitialRectPositions,
  createSpiralTargets,
  randomBetween,
  randomColor,
  shufflePoints,
  type CircleBody,
} from "./wachstum-helpers";

type Size = {
  width: number;
  height: number;
};

const circleRadiusVariance = 4;

export function Wachstum() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [spiralForce, setSpiralForce] = useState(0.08);
  const [pointAmount, setPointAmount] = useState(88);
  const [basePointRadius, setBasePointRadius] = useState(12);

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
    const center = new scope.Point(width * 0.5, height * 0.5);

    new scope.Path.Rectangle({
      from: [0, 0],
      to: [width, height],
      fillColor: "#10161f",
    });

    const positions = createInitialRectPositions(
      width,
      height,
      basePointRadius,
      pointAmount,
    );
    const spiralTargets = shufflePoints(
      createSpiralTargets(center, pointAmount, Math.min(width, height) * 0.02),
    );
    const shuffledPositions = shufflePoints(positions);

    const bodies: CircleBody[] = [];

    for (let i = 0; i < pointAmount; i++) {
      const position = shuffledPositions[i] ?? new scope.Point(center);
      const radius = Math.max(
        7,
        basePointRadius +
          randomBetween(-circleRadiusVariance, circleRadiusVariance),
      );
      const hue = (i * 137.5 + randomBetween(-12, 12)) % 360;
      const circle = new scope.Path.Circle({
        center: position,
        radius,
        fillColor: randomColor(hue),
        strokeColor: new scope.Color(0, 0, 0, 0.18),
        strokeWidth: 1,
      });

      const outward = position.subtract(center);
      const outwardDirection =
        outward.length > 0
          ? outward.normalize()
          : new scope.Point(
              Math.cos(randomBetween(0, Math.PI * 2)),
              Math.sin(randomBetween(0, Math.PI * 2)),
            );
      const burstAngle = randomBetween(0, Math.PI * 2);
      const burstImpulse = new scope.Point(
        Math.cos(burstAngle),
        Math.sin(burstAngle),
      ).multiply(randomBetween(120, 320));

      bodies.push({
        item: circle,
        velocity: outwardDirection
          .multiply(randomBetween(320, 680))
          .add(burstImpulse),
        baseHue: hue,
        target: new scope.Point(spiralTargets[i] ?? center),
        radius,
      });
    }

    let rafId = 0;
    let lastTs = performance.now();

    const clampToBounds = (body: CircleBody) => {
      const position = body.item.position;
      const radius = body.radius;

      if (position.x < radius) {
        body.item.position.x = radius;
        body.velocity.x *= -0.35;
      } else if (position.x > width - radius) {
        body.item.position.x = width - radius;
        body.velocity.x *= -0.35;
      }

      if (position.y < radius) {
        body.item.position.y = radius;
        body.velocity.y *= -0.35;
      } else if (position.y > height - radius) {
        body.item.position.y = height - radius;
        body.velocity.y *= -0.35;
      }
    };

    const resolveCollisions = () => {
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const delta = b.item.position.subtract(a.item.position);
          const distance = delta.length;
          const minDistance = a.radius + b.radius;

          if (distance === 0 || distance >= minDistance) {
            continue;
          }

          const overlap = minDistance - distance;
          const normal = delta.divide(distance || 1);
          const push = normal.multiply(overlap * 0.5);

          a.item.position = a.item.position.subtract(push);
          b.item.position = b.item.position.add(push);

          const relativeVelocity = b.velocity.subtract(a.velocity);
          const separatingSpeed = relativeVelocity.dot(normal);
          if (separatingSpeed < 0) {
            const impulse = normal.multiply(separatingSpeed * 0.4);
            a.velocity = a.velocity.add(impulse);
            b.velocity = b.velocity.subtract(impulse);
          }
        }
      }
    };

    const animate = () => {
      const now = performance.now();
      const deltaTime = Math.min(0.033, (now - lastTs) / 1000);
      lastTs = now;

      for (const body of bodies) {
        const toTarget = body.target.subtract(body.item.position);
        const distanceToTarget = toTarget.length;
        const targetDirection =
          distanceToTarget > 0
            ? toTarget.divide(distanceToTarget)
            : new scope.Point(0, 0);
        const spiralAngle = Math.atan2(
          body.target.y - center.y,
          body.target.x - center.x,
        );
        const swirl = new scope.Point(
          -Math.sin(spiralAngle),
          Math.cos(spiralAngle),
        ).multiply(spiralForce * 0.08);

        body.velocity = body.velocity
          .add(
            targetDirection.multiply(
              spiralForce * distanceToTarget * deltaTime,
            ),
          )
          .add(swirl.multiply(deltaTime))
          .multiply(0.985);

        const maxSpeed = 420 * deltaTime;
        if (body.velocity.length > maxSpeed) {
          body.velocity = body.velocity.normalize(maxSpeed);
        }

        body.item.position = body.item.position.add(body.velocity);

        const colorPulse = Math.min(1, body.velocity.length / 40);
        body.item.fillColor = new scope.Color({
          hue: (body.baseHue + colorPulse * 18) % 360,
          saturation: 0.72,
          brightness: 0.88,
        });

        clampToBounds(body);
      }

      resolveCollisions();
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);

      const project = scope.project;
      const view = scope.view;

      project?.remove();
      view?.remove();
    };
  }, [basePointRadius, pointAmount, size.height, size.width, spiralForce]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#10161f]">
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
      <div className="absolute left-5 top-5 max-w-md rounded-md bg-[#10161f]/80 px-4 py-3 text-[#e9f0f5] shadow-sm backdrop-blur-sm">
        <div className="text-sm font-semibold">Wachstum</div>
        <div className="mt-1 text-xs leading-5">
          <div>Spiral force: {spiralForce.toFixed(3)}</div>
          <div>Point amount: {pointAmount}</div>
          <div>Base point radius: {basePointRadius}px</div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span>Spiral force</span>
              <span>{spiralForce.toFixed(3)}</span>
            </div>
            <Slider.Root
              className="SliderRoot w-full"
              value={[spiralForce]}
              max={0.2}
              min={0.01}
              step={0.005}
              onValueChange={(value) => setSpiralForce(value[0] ?? 0.08)}
            >
              <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Spiral force" />
            </Slider.Root>
          </label>
          <label className="block text-xs font-medium">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span>Point amount</span>
              <span>{pointAmount}</span>
            </div>
            <Slider.Root
              className="SliderRoot w-full"
              value={[pointAmount]}
              max={180}
              min={10}
              step={1}
              onValueChange={(value) => setPointAmount(value[0] ?? 88)}
            >
              <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb className="SliderThumb" aria-label="Point amount" />
            </Slider.Root>
          </label>
          <label className="block text-xs font-medium">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span>Base point radius</span>
              <span>{basePointRadius}px</span>
            </div>
            <Slider.Root
              className="SliderRoot w-full"
              value={[basePointRadius]}
              max={30}
              min={4}
              step={1}
              onValueChange={(value) => setBasePointRadius(value[0] ?? 12)}
            >
              <Slider.Track className="SliderTrack">
                <Slider.Range className="SliderRange" />
              </Slider.Track>
              <Slider.Thumb
                className="SliderThumb"
                aria-label="Base point radius"
              />
            </Slider.Root>
          </label>
        </div>
      </div>
    </div>
  );
}
