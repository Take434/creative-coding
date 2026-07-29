import type { Hand } from "ml5";

export type Point = { x: number; y: number };

export type RectangleCorners = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};

export type HandData = {
  thumbTip: Point;
  indexTip: Point;
  thumbExtended: boolean;
  indexExtended: boolean;
};

const THUMB_TIP = 4;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const WRIST = 0;

export function extractHandData(hand: Hand): HandData | null {
  const keypoints = hand.keypoints;
  if (!keypoints || keypoints.length < 21) return null;

  const thumbTip = keypoints[THUMB_TIP];
  const indexTip = keypoints[INDEX_TIP];
  const indexPIP = keypoints[INDEX_PIP];
  const indexMCP = keypoints[INDEX_MCP];
  const wrist = keypoints[WRIST];

  const palmSize = distance(wrist, indexMCP);
  const thumbToIndex = distance(thumbTip, indexMCP);
  const thumbExtended = thumbToIndex > palmSize * 0.6;

  const indexToWrist = distance(indexTip, wrist);
  const indexPIPToWrist = distance(indexPIP, wrist);
  const indexExtended = indexToWrist > indexPIPToWrist;

  return {
    thumbTip: { x: thumbTip.x, y: thumbTip.y },
    indexTip: { x: indexTip.x, y: indexTip.y },
    thumbExtended,
    indexExtended,
  };
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function detectRectangle(
  leftHand: HandData,
  rightHand: HandData,
): RectangleCorners | null {
  if (!leftHand.thumbExtended || !rightHand.thumbExtended) return null;
  if (!leftHand.indexExtended || !rightHand.indexExtended) return null;

  const leftThumb = leftHand.thumbTip;
  const leftIndex = leftHand.indexTip;
  const rightThumb = rightHand.thumbTip;
  const rightIndex = rightHand.indexTip;

  const minX = Math.min(leftThumb.x, leftIndex.x, rightThumb.x, rightIndex.x);
  const maxX = Math.max(leftThumb.x, leftIndex.x, rightThumb.x, rightIndex.x);
  const minY = Math.min(leftThumb.y, leftIndex.y, rightThumb.y, rightIndex.y);
  const maxY = Math.max(leftThumb.y, leftIndex.y, rightThumb.y, rightIndex.y);

  const width = maxX - minX;
  const height = maxY - minY;

  if (width < 50 || height < 50) return null;

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomLeft: { x: minX, y: maxY },
    bottomRight: { x: maxX, y: maxY },
  };
}

export function detectThumbClick(
  prevLeftHand: HandData | null,
  prevRightHand: HandData | null,
  currentLeftHand: HandData,
  currentRightHand: HandData,
): boolean {
  if (!prevLeftHand || !prevRightHand) return false;

  const leftIndexDist = distance(
    prevLeftHand.indexTip,
    currentLeftHand.indexTip,
  );
  const rightIndexDist = distance(
    prevRightHand.indexTip,
    currentRightHand.indexTip,
  );

  const leftClicked =
    prevLeftHand.thumbExtended &&
    !currentLeftHand.thumbExtended &&
    currentLeftHand.indexExtended &&
    leftIndexDist < 50;

  const rightClicked =
    prevRightHand.thumbExtended &&
    !currentRightHand.thumbExtended &&
    currentRightHand.indexExtended &&
    rightIndexDist < 50;

  return leftClicked || rightClicked;
}

export function captureRectangle(
  video: HTMLVideoElement,
  corners: RectangleCorners,
  videoWidth: number,
  videoHeight: number,
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const scaleX = video.videoWidth / videoWidth;
  const scaleY = video.videoHeight / videoHeight;

  const x = corners.topLeft.x * scaleX;
  const y = corners.topLeft.y * scaleY;
  const width = (corners.topRight.x - corners.topLeft.x) * scaleX;
  const height = (corners.bottomLeft.y - corners.topLeft.y) * scaleY;

  canvas.width = width;
  canvas.height = height;

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -x - width, -y, video.videoWidth, video.videoHeight);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function generateRandomPattern(): string {
  const colors = [
    `hsl(${Math.random() * 360}, 70%, 60%)`,
    `hsl(${Math.random() * 360}, 70%, 60%)`,
    `hsl(${Math.random() * 360}, 70%, 60%)`,
  ];

  const patternTypes = ["stripes", "dots", "zigzag", "confetti"];
  const pattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];

  const canvas = document.createElement("canvas");
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, 40, 40);

  if (pattern === "stripes") {
    ctx.fillStyle = colors[1];
    for (let i = 0; i < 40; i += 8) {
      ctx.fillRect(i, 0, 4, 40);
    }
  } else if (pattern === "dots") {
    ctx.fillStyle = colors[1];
    for (let x = 5; x < 40; x += 10) {
      for (let y = 5; y < 40; y += 10) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === "zigzag") {
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 50; i += 10) {
      ctx.lineTo(i, (i / 10) % 2 === 0 ? 0 : 10);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 50; i += 10) {
      ctx.lineTo(i, 20 + ((i / 10) % 2 === 0 ? 0 : 10));
    }
    ctx.stroke();
  } else {
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(Math.random() * 40, Math.random() * 40, 4, 4);
    }
  }

  return canvas.toDataURL();
}
