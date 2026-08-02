import { useEffect, useRef, useState } from "react";
import ml5 from "ml5";
import type { HandPose, Hand } from "ml5";
import {
  extractHandData,
  detectRectangle,
  captureRectangle,
  type RectangleCorners,
} from "./handTracking";
import { Polaroid } from "./Polaroid";
import { ProjectDescription } from "@/components/project-description/project-description";
import { content } from "./description";

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const EXTENDED_FRAMES_REQUIRED = 10;
const CURLED_FRAMES_REQUIRED = 3;

type ThumbState = {
  extendedFrames: number;
  curledFrames: number;
  clickReady: boolean;
};

export function Verfolgt() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handPoseRef = useRef<HandPose | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const isCapturingRef = useRef(false);
  const [currentRectangle, setCurrentRectangle] =
    useState<RectangleCorners | null>(null);
  const captureTimeoutRef = useRef<number | null>(null);
  const thumbStateRef = useRef<{ left: ThumbState; right: ThumbState }>({
    left: { extendedFrames: 0, curledFrames: 0, clickReady: false },
    right: { extendedFrames: 0, curledFrames: 0, clickReady: false },
  });

  useEffect(() => {
    isCapturingRef.current = isCapturing;
  }, [isCapturing]);

  useEffect(() => {
    let animationFrame: number;
    let mounted = true;
    const videoElement = videoRef.current;
    let detectedRectangle: RectangleCorners | null = null;
    let lastValidRectangle: RectangleCorners | null = null;

    const updateThumbState = (
      state: ThumbState,
      isExtended: boolean,
    ): { newState: ThumbState; clicked: boolean } => {
      let clicked = false;

      if (isExtended) {
        state.extendedFrames++;
        state.curledFrames = 0;
        if (state.extendedFrames >= EXTENDED_FRAMES_REQUIRED) {
          state.clickReady = true;
        }
      } else {
        state.curledFrames++;
        if (state.clickReady && state.curledFrames >= CURLED_FRAMES_REQUIRED) {
          clicked = true;
          state.clickReady = false;
        }
        if (state.curledFrames > 5) {
          state.extendedFrames = 0;
        }
      }

      return { newState: state, clicked };
    };

    const processHands = (results: Hand[]) => {
      if (!videoRef.current || isCapturingRef.current) return;

      if (results.length < 2) {
        detectedRectangle = null;
        setCurrentRectangle(null);
        return;
      }

      const leftHand = results.find((h) => h.handedness === "Left");
      const rightHand = results.find((h) => h.handedness === "Right");

      if (!leftHand || !rightHand) {
        detectedRectangle = null;
        setCurrentRectangle(null);
        return;
      }

      const leftData = extractHandData(leftHand);
      const rightData = extractHandData(rightHand);

      if (!leftData || !rightData) {
        detectedRectangle = null;
        setCurrentRectangle(null);
        return;
      }

      const rectangle = detectRectangle(leftData, rightData);
      detectedRectangle = rectangle;
      if (rectangle) lastValidRectangle = rectangle;
      setCurrentRectangle(rectangle);

      const leftResult = updateThumbState(
        thumbStateRef.current.left,
        leftData.thumbExtended,
      );
      const rightResult = updateThumbState(
        thumbStateRef.current.right,
        rightData.thumbExtended,
      );

      thumbStateRef.current.left = leftResult.newState;
      thumbStateRef.current.right = rightResult.newState;

      const clicked = leftResult.clicked || rightResult.clicked;

      if (Math.random() < 0.02) {
        console.log("Thumb state:", {
          leftExtFrames: thumbStateRef.current.left.extendedFrames,
          leftCurlFrames: thumbStateRef.current.left.curledFrames,
          leftReady: thumbStateRef.current.left.clickReady,
          rightExtFrames: thumbStateRef.current.right.extendedFrames,
          rightCurlFrames: thumbStateRef.current.right.curledFrames,
          rightReady: thumbStateRef.current.right.clickReady,
        });
      }

      if (clicked && lastValidRectangle && !captureTimeoutRef.current) {
        console.log("CLICK DETECTED! Capturing photo...");
        console.log("Rectangle:", lastValidRectangle);
        const rectangle = lastValidRectangle;
        setIsCapturing(true);
        isCapturingRef.current = true;

        const imageUrl = captureRectangle(
          videoRef.current,
          rectangle,
          VIDEO_WIDTH,
          VIDEO_HEIGHT,
        );
        console.log("Captured image URL length:", imageUrl.length);
        setPhotos((prev) => {
          console.log("Photos count after capture:", prev.length + 1);
          return [...prev, imageUrl];
        });

        captureTimeoutRef.current = window.setTimeout(() => {
          setIsCapturing(false);
          isCapturingRef.current = false;
          captureTimeoutRef.current = null;
        }, 1500);
      }
    };

    const drawFrame = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const ctx = canvasRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

      if (!isCapturingRef.current) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          videoRef.current,
          -VIDEO_WIDTH,
          0,
          VIDEO_WIDTH,
          VIDEO_HEIGHT,
        );
        ctx.restore();

        if (detectedRectangle) {
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            detectedRectangle.topLeft.x,
            detectedRectangle.topLeft.y,
            detectedRectangle.topRight.x - detectedRectangle.topLeft.x,
            detectedRectangle.bottomLeft.y - detectedRectangle.topLeft.y,
          );
          ctx.setLineDash([]);
        }
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
        });

        if (!mounted || !videoRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (!mounted) return;

        const drawLoop = () => {
          if (!mounted) return;
          drawFrame();
          animationFrame = requestAnimationFrame(drawLoop);
        };
        drawLoop();

        handPoseRef.current = await ml5.handPose({
          maxHands: 2,
          flipped: true,
        });

        const detect = () => {
          if (!mounted) return;
          if (handPoseRef.current && videoRef.current) {
            handPoseRef.current.detect(videoRef.current, processHands);
          }
          requestAnimationFrame(detect);
        };
        detect();
      } catch (err) {
        console.error("Failed to start video:", err);
      }
    };

    startVideo();

    return () => {
      mounted = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  const photoPositions = photos.map((_, i) => {
    const angle = (i / Math.max(photos.length, 1)) * Math.PI * 2;
    const radius = 320;
    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px - 100px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px - 100px)`,
    };
  });

  return (
    <>
      <div className="relative w-full h-[94vh] bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          >
            <video
              ref={videoRef}
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              playsInline
              muted
              className="absolute opacity-0"
            />
            <canvas
              ref={canvasRef}
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              className="rounded-lg shadow-xl"
              style={{
                filter: isCapturing ? "brightness(2)" : "none",
                transition: "filter 0.1s",
              }}
            />
            {isCapturing && (
              <div className="absolute inset-0 bg-white opacity-80 rounded-lg animate-pulse" />
            )}
            {currentRectangle && !isCapturing && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                Hold thumb out, then curl to capture!
              </div>
            )}
          </div>
        </div>

        {photos.map((photo, i) => (
          <div
            key={i}
            className="absolute transition-all duration-500"
            style={{
              left: photoPositions[i].left,
              top: photoPositions[i].top,
              zIndex: i + 10,
            }}
          >
            <Polaroid imageUrl={photo} />
          </div>
        ))}
        {photos.length > 0 && (
          <div className="absolute top-4 left-4 bg-white text-black p-2 rounded z-50">
            Photos taken: {photos.length}
          </div>
        )}
      </div>
      <ProjectDescription {...content} />
    </>
  );
}
