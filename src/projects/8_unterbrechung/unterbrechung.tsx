import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, type RefObject } from "react";
import { Group, Mesh, Quaternion, Vector3 } from "three";

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
          <boxGeometry args={[50, 50, 50]} />
          <meshBasicMaterial wireframe />
        </mesh>
        <Boids />
      </Canvas>
      <div className="h-[80vh] ml-2"></div>
    </div>
  );
}

type boid = {
  id: string;
  initialPos: Vector3;
};

function Boids() {
  const groupRef = useRef<Group>();
  const [boids, setBoids] = useState<boid[]>([
    {
      id: crypto.randomUUID(),
      initialPos: new Vector3(0, 0, 0),
    },
  ]);

  useFrame((state) => {
    groupRef.current.children.forEach((x) => {
      x.position.add(new Vector3(0.1, 0, 0));
    });
  });

  return (
    <group ref={groupRef}>
      {boids.map((x) => (
        <mesh key={x.id} position={x.initialPos}>
          <sphereGeometry args={[0.5, 40, 40]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}
