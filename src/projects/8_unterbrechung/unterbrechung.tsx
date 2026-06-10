import { Boids } from "@/projects/8_unterbrechung/boids";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Quaternion } from "three";

const playingField = 50;

export function Unterbrechung() {
  return (
    <div className="h-full flex">
      <Canvas style={{ height: "94vh", width: "100vw" }}>
        <PerspectiveCamera
          makeDefault
          args={[45, 1 / 1, 1, 1000]}
          position={[-41, 70, 75]}
          quaternion={
            new Quaternion(
              -0.375123944,
              -0.1044666973,
              -0.0425917165,
              0.92008406,
            )
          }
        />
        <directionalLight position={[5, 5, 5]} />
        <ambientLight intensity={0.1} />
        <OrbitControls />
        <mesh>
          <boxGeometry args={[playingField, playingField, playingField]} />
          <meshBasicMaterial wireframe />
        </mesh>
        <Boids playingField={playingField} />
      </Canvas>
      <div className="h-[80vh] ml-2"></div>
    </div>
  );
}
