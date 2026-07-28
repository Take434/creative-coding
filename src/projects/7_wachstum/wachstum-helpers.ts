import paper from "paper";

export type CircleBody = {
  item: paper.Path;
  velocity: paper.Point;
  baseHue: number;
  target: paper.Point;
  radius: number;
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const shufflePoints = (points: paper.Point[]) => {
  const shuffled = [...points];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export const randomColor = (hue: number) => {
  return new paper.Color({
    hue,
    saturation: randomBetween(0.55, 0.82),
    brightness: randomBetween(0.72, 0.95),
  });
};

export const createInitialRectPositions = (
  width: number,
  height: number,
  radius: number,
  count: number,
) => {
  const positions: paper.Point[] = [];
  const spacing = radius * 2.2;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * (width / height))));
  const rows = Math.max(1, Math.ceil(count / cols));
  const gridWidth = (cols - 1) * spacing;
  const gridHeight = (rows - 1) * spacing;
  const startX = width * 0.5 - gridWidth * 0.5;
  const startY = height * 0.5 - gridHeight * 0.5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (positions.length >= count) {
        break;
      }

      const offsetX = row % 2 === 0 ? 0 : spacing * 0.5;
      positions.push(
        new paper.Point({
          x: startX + col * spacing + offsetX,
          y: startY + row * spacing,
        }),
      );
    }
  }

  return positions;
};

export const createSpiralTargets = (
  center: paper.Point,
  count: number,
  scale: number,
) => {
  const targets: paper.Point[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle;
    const radius = scale * Math.sqrt(i + 1) * 1.6;
    targets.push(
      new paper.Point({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      }),
    );
  }

  return targets;
};
