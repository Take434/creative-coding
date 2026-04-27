import { ProjectPreview } from "@/components/project-preview/ProjectPreview";
import type { ProjectPreviewProps } from "@/types/ProjectPreviewProps";
import farbfleck from "../../assets/ProjectPreviewCovers/Farbfleck.png";
import { Canvas } from "@react-three/fiber";
import { ConwaysGOL } from "@/components/overview/cgol";

export function Overview() {
  const previews: ProjectPreviewProps[] = [
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
  ];

  return (
    <>
      <div className="flex">
        <div className="flex flex-wrap gap-8 max-w-[70vw] mx-auto mt-8">
          {previews.map((x, i) => (
            <ProjectPreview key={i} {...x}></ProjectPreview>
          ))}
        </div>
      </div>
      <Canvas
        style={{ position: "absolute" }}
        className="w-screen h-full top-0 left-0 overflow-hidden -z-10"
      >
        <ambientLight intensity={1} />
        <ConwaysGOL />
      </Canvas>
    </>
  );
}
