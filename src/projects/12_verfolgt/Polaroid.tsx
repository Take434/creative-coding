import { useMemo } from "react";
import { generateRandomPattern } from "./handTracking";

type PolaroidProps = {
  imageUrl: string;
  style?: React.CSSProperties;
};

export function Polaroid({ imageUrl, style }: PolaroidProps) {
  const pattern = useMemo(() => generateRandomPattern(), []);
  const rotation = useMemo(() => Math.random() * 20 - 10, []);

  return (
    <div
      style={{
        padding: "12px 12px 40px 12px",
        backgroundImage: `url(${pattern})`,
        backgroundSize: "40px 40px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    >
      <img
        src={imageUrl}
        style={{
          display: "block",
          maxWidth: "200px",
          maxHeight: "200px",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
