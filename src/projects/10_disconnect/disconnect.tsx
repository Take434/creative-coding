import { useEffect, useRef } from "react";
import Matter from "matter-js";

const { Engine, Render, Runner, Bodies, Body, Composite, Constraint } = Matter;

// Random color generator
function randomColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8B500",
    "#FF8C00",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Create soft body (blob)
function createSoftBody(
  x: number,
  y: number,
  columns: number,
  rows: number,
  particleRadius: number,
  stiffness: number,
  color: string,
): { bodies: Matter.Body[]; constraints: Matter.Constraint[] } {
  const bodies: Matter.Body[] = [];
  const constraints: Matter.Constraint[] = [];
  const spacing = particleRadius * 2.2;

  // Create particles in a grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const px = x + col * spacing - (columns * spacing) / 2;
      const py = y + row * spacing - (rows * spacing) / 2;

      const particle = Bodies.circle(px, py, particleRadius, {
        restitution: 0.85,
        friction: 0.2,
        frictionAir: 0.008,
        render: {
          fillStyle: color,
          opacity: 0.9,
        },
        collisionFilter: {
          category: 0x0002,
          mask: 0x0001 | 0x0002, // Collides with walls and other blob particles
        },
      });

      Body.setMass(particle, 2);
      bodies.push(particle);
    }
  }

  // Create constraints between adjacent particles
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;

      // Horizontal constraint
      if (col < columns - 1) {
        constraints.push(
          Constraint.create({
            bodyA: bodies[index],
            bodyB: bodies[index + 1],
            stiffness: stiffness,
            damping: 0.1,
            render: { visible: false },
          }),
        );
      }

      // Vertical constraint
      if (row < rows - 1) {
        constraints.push(
          Constraint.create({
            bodyA: bodies[index],
            bodyB: bodies[index + columns],
            stiffness: stiffness,
            damping: 0.1,
            render: { visible: false },
          }),
        );
      }

      // Diagonal constraints for more stability
      if (col < columns - 1 && row < rows - 1) {
        constraints.push(
          Constraint.create({
            bodyA: bodies[index],
            bodyB: bodies[index + columns + 1],
            stiffness: stiffness * 0.5,
            damping: 0.1,
            render: { visible: false },
          }),
        );
        constraints.push(
          Constraint.create({
            bodyA: bodies[index + 1],
            bodyB: bodies[index + columns],
            stiffness: stiffness * 0.5,
            damping: 0.1,
            render: { visible: false },
          }),
        );
      }
    }
  }

  return { bodies, constraints };
}

export function Disconnect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Setup Matter.js
    const engine = Engine.create({
      gravity: { x: 0, y: 1 },
    });
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "#1a1a2e",
      },
    });

    // Create walls
    const wallThickness = 50;
    const walls = [
      // Bottom
      Bodies.rectangle(
        width / 2,
        height + wallThickness / 2,
        width,
        wallThickness,
        {
          isStatic: true,
          render: { fillStyle: "#16213e" },
          collisionFilter: { category: 0x0001 },
        },
      ),
      // Top
      Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: "#16213e" },
        collisionFilter: { category: 0x0001 },
      }),
      // Left
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { fillStyle: "#16213e" },
        collisionFilter: { category: 0x0001 },
      }),
      // Right
      Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height,
        {
          isStatic: true,
          render: { fillStyle: "#16213e" },
          collisionFilter: { category: 0x0001 },
        },
      ),
    ];

    Composite.add(engine.world, walls);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Mouse click handler for spawning soft bodies
    const handleClick = (event: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Spawn a small soft body blob
      const color = randomColor();
      const columns = 4 + Math.floor(Math.random() * 3); // 4-6 columns
      const rows = 4 + Math.floor(Math.random() * 3); // 4-6 rows
      const particleRadius = 8 + Math.random() * 4; // 8-12 radius

      const softBody = createSoftBody(
        x,
        y,
        columns,
        rows,
        particleRadius,
        0.25,
        color,
      );

      Composite.add(engine.world, [
        ...softBody.bodies,
        ...softBody.constraints,
      ]);
    };

    const canvas = canvasRef.current;
    canvas.addEventListener("click", handleClick);

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      render.canvas.width = newWidth;
      render.canvas.height = newHeight;
      render.options.width = newWidth;
      render.options.height = newHeight;

      // Update wall positions
      Body.setPosition(walls[0], {
        x: newWidth / 2,
        y: newHeight + wallThickness / 2,
      });
      Body.setPosition(walls[1], { x: newWidth / 2, y: -wallThickness / 2 });
      Body.setPosition(walls[3], {
        x: newWidth + wallThickness / 2,
        y: newHeight / 2,
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      Runner.stop(runner);
      Render.stop(render);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
