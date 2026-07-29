declare module "ml5" {
  export interface Keypoint {
    x: number;
    y: number;
    name: string;
  }

  export interface Hand {
    keypoints: Keypoint[];
    handedness: "Left" | "Right";
    score: number;
  }

  export interface HandPose {
    detect: (
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
      callback: (results: Hand[]) => void,
    ) => void;
  }

  export interface HandPoseOptions {
    maxHands?: number;
    flipped?: boolean;
    runtime?: "mediapipe" | "tfjs";
  }

  function handPose(options?: HandPoseOptions): Promise<HandPose>;

  export default { handPose };
}
