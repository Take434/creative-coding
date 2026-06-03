import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Frustum, Matrix4, Mesh, Vector3 } from "three";

type sphere = {
  id: string;
  radius: number;
  moveVector: Vector3;
  position: Vector3;
};

export function Fokus() {
  const [spheres, setSpheres] = useState<sphere[]>([
    {
      id: crypto.randomUUID(),
      radius: 0.14,
      moveVector: new Vector3(0.0, 0.05, 0.001),
      position: new Vector3(-1, 0.5, 3),
    },
  ]);

  useEffect(() => {
    console.log("triggered");
    const randomBetween = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };

    const addRandomSphere = () => {
      setSpheres((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          radius: randomBetween(0.005, 0.25),
          moveVector: new Vector3(
            randomBetween(0.0007, 0.01),
            randomBetween(-0.01, 0.01),
            randomBetween(0.0001, 0.001),
          ),
          position: new Vector3(
            randomBetween(-2.5, -1.8),
            randomBetween(-0.8, 0.8),
            3,
          ),
        },
      ]);

      window.setTimeout(() => addRandomSphere(), randomBetween(1000, 3000));
    };

    window.setTimeout(() => {
      addRandomSphere();
    }, 1000);
  }, []);

  const removeSphere = (id: string) => {
    setSpheres((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="h-full flex">
      <Canvas style={{ height: "94vh", width: "100vw" }}>
        <ambientLight intensity={3} />
        <mesh>
          <planeGeometry args={[42, 8]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh>
          <sphereGeometry args={[3, 40, 40]} />
          <meshBasicMaterial color="red" />
        </mesh>
        {spheres.map((x) => (
          <Sphere sphere={x} removeSphere={removeSphere} key={x.id} />
        ))}
      </Canvas>
      <div className="h-[80vh] ml-2"></div>
    </div>
  );
}

function Sphere({
  sphere,
  removeSphere,
}: {
  sphere: sphere;
  removeSphere: (id: string) => void;
}) {
  const ref = useRef<Mesh>(null);
  const frustum = new Frustum();

  useFrame((state) => {
    ref.current!.position.add(sphere.moveVector);

    frustum.setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(
        state.camera.projectionMatrix,
        state.camera.matrixWorldInverse,
      ),
    );

    if (!frustum.containsPoint(ref.current!.position)) {
      removeSphere(sphere.id);
    }
  });

  return (
    <mesh position={sphere.position} ref={ref}>
      <sphereGeometry args={[sphere.radius, 40, 40]} />
      <meshBasicMaterial color="black" />
    </mesh>
  );
}
