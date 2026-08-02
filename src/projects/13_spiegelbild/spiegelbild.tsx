import { useEffect, useRef, useState, useCallback } from "react";
import paper from "paper";
import { ProjectDescription } from "@/components/project-description/project-description";
import { content } from "./description";

function createFlower(
  center: paper.Point,
  size: number,
  petalCount: number = 5,
): paper.CompoundPath {
  const paths: paper.Path[] = [];

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalLength = size * 0.8;
    const petalWidth = size * 0.4;

    const petal = new paper.Path.Ellipse({
      center: new paper.Point(
        center.x + Math.cos(angle) * petalLength * 0.4,
        center.y + Math.sin(angle) * petalLength * 0.4,
      ),
      size: new paper.Size(petalWidth, petalLength),
    });
    petal.rotate((angle * 180) / Math.PI + 90, petal.bounds.center);
    paths.push(petal);
  }

  const centerCircle = new paper.Path.Circle({
    center: center,
    radius: size * 0.2,
  });
  paths.push(centerCircle);

  const compound = new paper.CompoundPath({
    children: paths,
    fillColor: new paper.Color("#000000"),
  });

  return compound;
}

function getBrightness(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
): number {
  const index = (Math.floor(y) * width + Math.floor(x)) * 4;
  const r = imageData.data[index];
  const g = imageData.data[index + 1];
  const b = imageData.data[index + 2];

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function generateStipple(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  density: number,
  minSize: number,
  maxSize: number,
) {
  paper.project.clear();

  const width = canvas.width;
  const height = canvas.height;

  const bg = new paper.Path.Rectangle(new paper.Rectangle(0, 0, width, height));
  bg.fillColor = new paper.Color("#ffffff");

  const scale = Math.min(width / image.width, height / image.height);
  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;
  const offsetX = (width - imgWidth) / 2;
  const offsetY = (height - imgHeight) / 2;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.drawImage(image, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

  const step = density;

  for (let y = step / 2; y < imgHeight; y += step) {
    for (let x = step / 2; x < imgWidth; x += step) {
      const imgX = (x / imgWidth) * image.width;
      const imgY = (y / imgHeight) * image.height;

      const brightness = getBrightness(imageData, imgX, imgY, image.width);

      if (brightness > 240) continue;

      const darkness = 1 - brightness / 255;
      const size = minSize + darkness * (maxSize - minSize);

      if (size < minSize * 0.5) continue;

      const jitterX = (Math.random() - 0.5) * step * 0.3;
      const jitterY = (Math.random() - 0.5) * step * 0.3;

      const canvasX = offsetX + x + jitterX;
      const canvasY = offsetY + y + jitterY;

      const petalCount = 4 + Math.floor(Math.random() * 3);

      const flower = createFlower(
        new paper.Point(canvasX, canvasY),
        size,
        petalCount,
      );
      flower.rotate(Math.random() * 360);
    }
  }
}

export function Spiegelbild() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [density, setDensity] = useState(12);
  const [minSize, setMinSize] = useState(2);
  const [maxSize, setMaxSize] = useState(10);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = URL.createObjectURL(file);
    },
    [],
  );

  const regenerate = useCallback(() => {
    if (canvasRef.current && image) {
      generateStipple(canvasRef.current, image, density, minSize, maxSize);
    }
  }, [image, density, minSize, maxSize]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    paper.setup(canvas);
    paper.view.viewSize = new paper.Size(width, height);

    const bg = new paper.Path.Rectangle(
      new paper.Rectangle(0, 0, width, height),
    );
    bg.fillColor = new paper.Color("#f5f5f5");

    new paper.PointText({
      point: new paper.Point(width / 2, height / 2),
      content: "Upload an image to begin",
      fontFamily: "sans-serif",
      fontSize: 24,
      fillColor: new paper.Color("#999999"),
      justification: "center",
    });

    return () => {
      paper.project?.clear();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      paper.view.viewSize = new paper.Size(newWidth, newHeight);

      if (image) {
        generateStipple(canvas, image, density, minSize, maxSize);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [image, density, minSize, maxSize]);

  useEffect(() => {
    if (canvasRef.current && image) {
      generateStipple(canvasRef.current, image, density, minSize, maxSize);
    }
  }, [image, density, minSize, maxSize]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "94vh",
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
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 15,
            alignItems: "center",
            padding: "15px 20px",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 10,
          }}
        >
          <label
            style={{
              padding: "10px 20px",
              background: "#333",
              color: "#fff",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#666" }}>
              Density: {density}
            </label>
            <input
              type="range"
              min="6"
              max="30"
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#666" }}>
              Min Size: {minSize}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "#666" }}>
              Max Size: {maxSize}
            </label>
            <input
              type="range"
              min="5"
              max="25"
              value={maxSize}
              onChange={(e) => setMaxSize(Number(e.target.value))}
              style={{ width: 100 }}
            />
          </div>

          <button
            onClick={regenerate}
            disabled={!image}
            style={{
              padding: "10px 20px",
              background: image ? "#333" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: image ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            Regenerate
          </button>
        </div>
      </div>
      <ProjectDescription {...content} />
    </>
  );
}
