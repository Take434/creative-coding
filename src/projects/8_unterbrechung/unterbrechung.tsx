/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/refs */
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, Quaternion, Vector3 } from "three";

const boidViewDistance = 5;
const playingField = 50;
const boidCount = 100;
const alignWeight = 1;
const cohesWeight = 0.4;
const seperWeight = 1.5;
const boidMaxForce = 1;
const wallForceScale = 0.2;
const boidMinSpeed = 0.05;
const boidMaxSpeed = 0.8;

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
      position: new Vector3(
        (Math.random() - 0.5) * playingField,
        (Math.random() - 0.5) * playingField,
        (Math.random() - 0.5) * playingField,
      ),
      velocity: new Vector3(Math.random(), 0, 0).normalize(),
    })),
  );
  const meshes = useRef<Mesh[]>([]);

  const up = new Vector3(0, 1, 0);
  const quat = new Quaternion();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useFrame((_state, delta) => {
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
        .filter(
          (x) =>
            x != undefined &&
            x.i !== i &&
            b.position.distanceToSquared(x.b.position) <
              boidViewDistance * boidViewDistance,
        );

      const alignment = new Vector3();
      const cohesion = new Vector3();
      const seperation = new Vector3();

      neighbors.forEach((x) => {
        alignment.add(x.b.velocity);
        cohesion.add(x.b.position);

        const diff = new Vector3().subVectors(b.position, x.b.position);
        const distSq = diff.lengthSq();

        if (distSq > 0) {
          diff.divideScalar(distSq);
          seperation.add(diff);
        }
      });

      if (neighbors.length > 0) {
        alignment.divideScalar(neighbors.length);
        alignment.sub(b.velocity);

        cohesion.divideScalar(neighbors.length);
        cohesion.sub(b.position);

        const accel = new Vector3();
        accel.addScaledVector(alignment, alignWeight);
        accel.addScaledVector(cohesion, cohesWeight);
        accel.addScaledVector(seperation, seperWeight);

        accel.clampLength(0, boidMaxForce);

        b.velocity.multiplyScalar(0.995);
        b.velocity.add(accel);
      }

      const wallForce = new Vector3();
      const half = playingField / 2;
      const margin = boidViewDistance * 2;

      if (b.position.x > half - margin) {
        const t = (b.position.x - (half - margin)) / margin;
        wallForce.x -= t;
      }

      if (b.position.x < -half + margin) {
        const t = (-half + margin - b.position.x) / margin;
        wallForce.x += t;
      }

      if (b.position.y > half - margin) {
        const t = (b.position.y - (half - margin)) / margin;
        wallForce.y -= t;
      }

      if (b.position.y < -half + margin) {
        const t = (-half + margin - b.position.y) / margin;
        wallForce.y += t;
      }

      if (b.position.z > half - margin) {
        const t = (b.position.z - (half - margin)) / margin;
        wallForce.z -= t;
      }

      if (b.position.z < -half + margin) {
        const t = (-half + margin - b.position.z) / margin;
        wallForce.z += t;
      }

      wallForce.clampLength(0, boidMaxForce);
      wallForce.multiplyScalar(wallForceScale);
      b.velocity.addScaledVector(wallForce, 0.33);
      b.velocity.clampLength(boidMinSpeed, boidMaxSpeed);
      b.position.add(b.velocity);
      b.position.x = Math.max(-half, Math.min(half, b.position.x));
      b.position.y = Math.max(-half, Math.min(half, b.position.y));
      b.position.z = Math.max(-half, Math.min(half, b.position.z));

      meshes.current[i].position.copy(b.position);
      const dir = b.velocity.clone().normalize();
      quat.setFromUnitVectors(new Vector3(0, 1, 0), dir);
      meshes.current[i].quaternion.copy(quat);
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
          <coneGeometry args={[0.4, 1.2, 8]} />
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
  const neighbors = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        neighbors.push(
          hashedIndexFromPostion(
            pos
              .clone()
              .add(
                new Vector3(
                  boidViewDistance * dx,
                  boidViewDistance * dy,
                  boidViewDistance * dz,
                ),
              ),
          ),
        );
      }
    }
  }

  return neighbors;
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
