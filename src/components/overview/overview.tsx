import { ProjectPreview } from "@/components/project-preview/ProjectPreview";
import type { ProjectPreviewProps } from "@/types/ProjectPreviewProps";
import styx from "../../assets/ProjectPreviewCovers/styx-cover.png";

export function Overview() {
  const previews: ProjectPreviewProps[] = [
    {
      name: "Farbfleck",
      thumbnail: styx,
      description: "Cooles Project",
      projectLink: "/farbfleck",
    },
  ];

  return (
    <div className="flex">
      {previews.map((x, i) => (
        <ProjectPreview key={i} {...x}></ProjectPreview>
      ))}
    </div>
  );
}
