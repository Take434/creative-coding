/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/refs */
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3, Mesh, Quaternion } from "three";

type boid = {
  position: Vector3;
  velocity: Vector3;
};

const boidViewDistance = 5;
const boidCount = 500;
const alignWeight = 1;
const cohesWeight = 0.4;
const seperWeight = 1.5;
const boidMaxForce = 1;
const wallForceScale = 0.2 * 0.33;
const boidMinSpeed = 0.05;
const boidMaxSpeed = 0.8;

export function Boids({ playingField }: { playingField: number }) {
  //setup variables and refs
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
  const quat = new Quaternion();
  const explosionMesh = useRef<Mesh>(null);

  const explosion = useRef<{
    start: number;
    end: number;
    center: Vector3;
    radius: number;
  }>({
    start: 5,
    end: 5.5,
    center: new Vector3(
      (Math.random() - 0.5) * playingField,
      (Math.random() - 0.5) * playingField,
      (Math.random() - 0.5) * playingField,
    ),
    radius: (Math.random() * playingField) / 2 + 5,
  });

  //main frame loop
  useFrame((state) => {
    const partitions: { b: boid; i: number }[][] = [];

    //add all boids in partitions
    boids.current.forEach((b, i) => {
      const j = hashedIndexFromPostion(b.position, playingField);

      if (!partitions[j]) {
        partitions[j] = [];
      }

      partitions[j].push({ b, i });
    });

    //get densest partition
    const densestPartition = [...partitions].sort(
      (a, b) => b.length - a.length,
    )[0];
    const newCenter = densestPartition[0].b.position;

    //check if explosion is done, initiate queue next one
    if (state.clock.elapsedTime > explosion.current.end) {
      const start = state.clock.elapsedTime + (Math.random() + 0.5) * 2;
      explosion.current = {
        start: start,
        end: start + 0.5,
        center: newCenter,
        radius: (Math.random() * playingField) / 2 + 5,
      };
    }

    //show explosion mesh (when active explosion)
    if (explosionMesh.current) {
      const active =
        state.clock.elapsedTime >= explosion.current.start &&
        state.clock.elapsedTime <= explosion.current.end;

      explosionMesh.current.visible = active;

      if (active) {
        //set position and expand radius slowly to match explosion radius
        explosionMesh.current.position.copy(explosion.current.center);
        const progress =
          (state.clock.elapsedTime - explosion.current.start) /
          (explosion.current.end - explosion.current.start);
        const currentRadius = explosion.current.radius * progress;

        explosionMesh.current.scale.setScalar(currentRadius);
      }
    }

    //check neighboring partitions for each boid and compute move vector
    boids.current.forEach((b, i) => {
      const neighborCells = getNeighboringIndicesFromPos(
        b.position,
        playingField,
      );

      //get all boids from neighboring cells, filter out self and those out of view distance
      const neighbors = neighborCells
        .flatMap((x) => partitions[x])
        .filter(
          (x) =>
            x != undefined &&
            x.i !== i &&
            b.position.distanceToSquared(x.b.position) <
              boidViewDistance * boidViewDistance,
        );

      //calculate forces effecting each boid based on all neighboring boids
      const alignment = new Vector3();
      const cohesion = new Vector3();
      const seperation = new Vector3();

      neighbors.forEach((x) => {
        //alignment and coheision are the average off all neighbors
        alignment.add(x.b.velocity);
        cohesion.add(x.b.position);

        //seperation force is added based on the distance of the neighbor to the boid
        const diff = new Vector3().subVectors(b.position, x.b.position);
        const distSq = diff.lengthSq();

        if (distSq > 0) {
          diff.divideScalar(distSq);
          seperation.add(diff);
        }
      });

      if (neighbors.length > 0) {
        //get averages and substract current velocity
        //then get vector from curr velocity to the average (direction to move in)
        alignment.divideScalar(neighbors.length);
        alignment.sub(b.velocity);

        cohesion.divideScalar(neighbors.length);
        cohesion.sub(b.position);

        //add all forces together
        const accel = new Vector3();
        accel.addScaledVector(alignment, alignWeight);
        accel.addScaledVector(cohesion, cohesWeight);
        accel.addScaledVector(seperation, seperWeight);

        accel.clampLength(0, boidMaxForce);

        //multiply by 0.995 so that boids dont gain more energy during simulation
        b.velocity.multiplyScalar(0.995);
        b.velocity.add(accel);
      }

      //determine force for each wall of the playing field, is used to make them steer away from the walls
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

      //dampen wall force to avoid boids clumping in the middle
      wallForce.clampLength(0, boidMaxForce);
      wallForce.multiplyScalar(wallForceScale);
      b.velocity.add(wallForce);
      b.velocity.clampLength(boidMinSpeed, boidMaxSpeed);

      // add explosion force if it is time for an explosion
      if (state.clock.elapsedTime > explosion.current.start) {
        const dir = b.position.clone().sub(explosion.current.center);
        const dist = dir.length();

        if (dist < explosion.current.radius) {
          const t = dist / explosion.current.radius;

          const strength = (1 - t) * (1 - t);
          dir.normalize();

          b.velocity.addScaledVector(dir, strength * 3);
        }
      }

      //add the forces to the position and clamp position to inside the playing Field
      b.position.add(b.velocity);
      b.position.x = Math.max(-half, Math.min(half, b.position.x));
      b.position.y = Math.max(-half, Math.min(half, b.position.y));
      b.position.z = Math.max(-half, Math.min(half, b.position.z));

      //move the mesh according to the boid, turn the cone to face in direction of velocity
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
      <mesh ref={explosionMesh}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#66ccff" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/**
 * gets neighboring indices (hashed), includes self
 */
const getNeighboringIndicesFromPos = (
  pos: Vector3,
  playingField: number,
): number[] => {
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
            playingField,
          ),
        );
      }
    }
  }

  return neighbors;
};

//moves the position into the positive and calls hash3DIndex
const hashedIndexFromPostion = (pos: Vector3, playingField: number): number => {
  const x = Math.floor((pos.x + playingField / 2) / boidViewDistance);
  const y = Math.floor((pos.y + playingField / 2) / boidViewDistance);
  const z = Math.floor((pos.z + playingField / 2) / boidViewDistance);

  return hash3DIndex(x, y, z, playingField);
};

//"flattens" the 3d array to a 1d array
const hash3DIndex = (
  x: number,
  y: number,
  z: number,
  playingField: number,
): number => {
  const cellCount = Math.floor(playingField / boidViewDistance);
  return x + y * cellCount + z * cellCount * cellCount;
};
