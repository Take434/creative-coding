/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/refs */
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Quaternion, Vector3 } from "three";

const boidViewDistance = 2;
const playingField = 50;
const boidCount = 20;
const boidMinSpeed = 0.05;
const boidMaxSpeed = 1;
const alignWeight = 0.2;
const cohesWeight = 0.2;
const seperWeight = 5;
const boidMaxForce = 1;

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
        <Boids />
      </Canvas>
      <div className="h-[80vh] ml-2"></div>
    </div>
  );
}

type boid = {
  position: Vector3;
  velocity: Vector3;
};

function Boids() {
  const boids = useRef<boid[]>(
    Array.from({ length: boidCount }, () => ({
      position: new Vector3(Math.random(), Math.random(), Math.random()),
      velocity: new Vector3(Math.random(), 0, 0).normalize(),
    })),
  );
  const meshes = useRef<Mesh[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFrame((_state) => {
    const partitions: { b: boid; i: number }[][] = [];

    //add all boids in partitions
    boids.current.forEach((b, i) => {
      const j = hashedIndexFromPostion(b.position);

      if (!partitions[j]) {
        partitions[j] = [];
      }

      partitions[j].push({ b, i });
    });

    //check neighboring partitions for each boid and compute move vector
    boids.current.forEach((b, i) => {
      const neighborCells = getNeighboringIndicesFromPos(b.position);
      const neighbors = neighborCells
        .flatMap((x) => partitions[x])
        .filter((x) => x != undefined);

      const alignment = new Vector3();
      const cohesion = new Vector3();
      const seperation = new Vector3();

      neighbors.forEach((x) => {
        alignment.add(x.b.velocity);
        cohesion.add(x.b.position);

        const diff = new Vector3().subVectors(b.position, x.b.position);
        const dist = diff.length();

        if (dist > 0) {
          diff.divideScalar(dist * dist);
          seperation.add(diff);
        }
      });

      if (neighbors.length > 0) {
        alignment.divideScalar(neighborCells.length);
        alignment.normalize();
        alignment.multiplyScalar(boidMaxSpeed);
        alignment.sub(b.velocity);

        cohesion.divideScalar(neighborCells.length);
        cohesion.sub(b.position);
        cohesion.normalize();
        cohesion.multiplyScalar(boidMaxSpeed);
        cohesion.sub(b.velocity);

        seperation.divideScalar(neighborCells.length);
        seperation.normalize();
        seperation.multiplyScalar(boidMaxSpeed);
        seperation.sub(b.velocity);

        const accel = new Vector3();
        accel.addScaledVector(alignment, alignWeight);
        accel.addScaledVector(cohesion, cohesWeight);
        accel.addScaledVector(seperation, seperWeight);

        accel.clampLength(0, boidMaxForce);

        b.velocity.add(accel);
        b.velocity.clampLength(boidMinSpeed, boidMaxSpeed);
      }

      b.position.add(b.velocity);
      meshes.current[i].position.copy(b.position);
    });
  });

  return (
    <group>
      {boids.current.map((x, i) => (
        <mesh
          key={i}
          position={x.position}
          ref={(m) => {
            if (m) meshes.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.5, 40, 40]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * gets neighboring indices (hashed), includes self
 */
const getNeighboringIndicesFromPos = (pos: Vector3): number[] => {
  return [
    hashedIndexFromPostion(pos),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(boidViewDistance, 0, 0)),
    ),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(-boidViewDistance, 0, 0)),
    ),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(0, boidViewDistance, 0)),
    ),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(0, -boidViewDistance, 0)),
    ),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(0, 0, boidViewDistance)),
    ),
    hashedIndexFromPostion(
      pos.clone().add(new Vector3(0, 0, -boidViewDistance)),
    ),
  ];
};

const hashedIndexFromPostion = (pos: Vector3): number => {
  const x = Math.floor((pos.x + playingField / 2) / boidViewDistance);
  const y = Math.floor((pos.y + playingField / 2) / boidViewDistance);
  const z = Math.floor((pos.z + playingField / 2) / boidViewDistance);

  return hash3DIndex(x, y, z);
};

const hash3DIndex = (x: number, y: number, z: number): number => {
  const cellCount = Math.floor(playingField / boidViewDistance);
  return x + y * cellCount + z * cellCount * cellCount;
};
