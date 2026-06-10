import { ProjectPreview } from "@/components/project-preview/ProjectPreview";
import type { ProjectPreviewProps } from "@/types/ProjectPreviewProps";
import farbfleck from "../../assets/ProjectPreviewCovers/Farbfleck.png";
import { Canvas } from "@react-three/fiber";
import { ConwaysGOL } from "@/components/overview/cgol";
import unwahrscheinlich from "../../assets/ProjectPreviewCovers/Unwahrscheinlich.png";
import loop from "../../assets/ProjectPreviewCovers/Loop.png";
import fokus from "../../assets/ProjectPreviewCovers/FokusCover.png";
import unterbrechung from "../../assets/ProjectPreviewCovers/Unterbrechung.png";
import wip from "../../assets/ProjectPreviewCovers/wip.jpg";

export function Overview() {
  const previews: ProjectPreviewProps[] = [
    {
      name: "Farbfleck",
      thumbnail: farbfleck,
      description: "Cool Project",
      projectLink: "/farbfleck",
    },
    {
      name: "Unwahrscheinlich",
      thumbnail: unwahrscheinlich,
      description: "Another cool project",
      projectLink: "/unwahrscheinlich",
    },
    {
      name: "Loop",
      thumbnail: loop,
      description: "Woow, so cool",
      projectLink: "/loop",
    },
    {
      name: "Fokus",
      thumbnail: fokus,
      description: "more cool",
      projectLink: "/fokus",
    },
    {
      name: "Gib mir ein Zeichen",
      thumbnail: wip,
      description: "more cool",
      projectLink: "/gib-mir-ein-zeichen",
    },
    {
      name: "Nochmal",
      thumbnail: wip,
      description: "",
      projectLink: "/nochmal",
    },
    {
      name: "Wachstum",
      thumbnail: wip,
      description: "",
      projectLink: "/wachstum",
    },
    {
      name: "Unterbrechung",
      thumbnail: unterbrechung,
      description: "",
      projectLink: "/unterbrechung",
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
        style={{ position: "fixed" }}
        className="w-screen h-full top-0 left-0 overflow-hidden -z-10"
      >
        <ambientLight intensity={1} />
        <ConwaysGOL />
      </Canvas>
    </>
  );
}
