import paper from "paper";

export type GrammarRules = Record<string, string>;

type TurtleSegment = {
  from: paper.Point;
  to: paper.Point;
};

export type DrawGrammarOptions = {
  angle: number;
  lineLength: number;
  lineColor?: string;
  lineWidth?: number;
  padding?: number;
  startAngle?: number;
  randomAngleJitter?: number;
};

type SimulatedGrammar = {
  segments: TurtleSegment[];
  bounds: paper.Rectangle;
};

const DEFAULT_OPTIONS: Required<DrawGrammarOptions> = {
  angle: 90,
  lineLength: 18,
  lineColor: "#101820",
  lineWidth: 2,
  padding: 48,
  startAngle: 0,
  randomAngleJitter: 0,
};

const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export function expandGrammar(
  axiom: string,
  rules: GrammarRules,
  repetitions: number,
): string {
  let current = axiom;

  for (let i = 0; i < repetitions; i++) {
    current = current
      .split("")
      .map((character) => rules[character] ?? character)
      .join("");
  }

  return current;
}

function simulateGrammarString(
  instructions: string,
  options: DrawGrammarOptions,
): SimulatedGrammar {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const segments: TurtleSegment[] = [];
  let position = new paper.Point(0, 0);
  let angle = merged.startAngle;

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  const updateBounds = (point: paper.Point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  };

  const stepForward = (drawLine: boolean) => {
    const stepAngle =
      merged.randomAngleJitter > 0
        ? angle +
          randomBetween(-merged.randomAngleJitter, merged.randomAngleJitter)
        : angle;
    const direction = new paper.Point({
      angle: stepAngle,
      length: merged.lineLength,
    });
    const next = position.add(direction);

    if (drawLine) {
      segments.push({ from: position, to: next });
    }

    position = next;
    updateBounds(position);
  };

  for (const character of instructions) {
    if (character === "F") {
      stepForward(true);
      continue;
    }

    if (character === "f") {
      stepForward(false);
      continue;
    }

    if (character === "+") {
      angle -= merged.angle;
      continue;
    }

    if (character === "-") {
      angle += merged.angle;
    }
  }

  return {
    segments,
    bounds: new paper.Rectangle(minX, minY, maxX - minX || 1, maxY - minY || 1),
  };
}

export function drawGrammarString(
  scope: paper.PaperScope,
  instructions: string,
  options: DrawGrammarOptions,
): paper.Group {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const simulation = simulateGrammarString(instructions, merged);
  const availableWidth = Math.max(
    1,
    scope.view.size.width - merged.padding * 2,
  );
  const availableHeight = Math.max(
    1,
    scope.view.size.height - merged.padding * 2,
  );
  const scale = Math.min(
    availableWidth / simulation.bounds.width,
    availableHeight / simulation.bounds.height,
    1,
  );

  const scaledWidth = simulation.bounds.width * scale;
  const scaledHeight = simulation.bounds.height * scale;
  const offsetX =
    (scope.view.size.width - scaledWidth) * 0.5 - simulation.bounds.x * scale;
  const offsetY =
    (scope.view.size.height - scaledHeight) * 0.5 - simulation.bounds.y * scale;

  const group = new scope.Group();

  for (const segment of simulation.segments) {
    group.addChild(
      new scope.Path.Line({
        from: segment.from.multiply(scale).add([offsetX, offsetY]),
        to: segment.to.multiply(scale).add([offsetX, offsetY]),
        strokeColor: merged.lineColor,
        strokeWidth: Math.max(1, merged.lineWidth * scale),
        strokeCap: "round",
      }),
    );
  }

  return group;
}
