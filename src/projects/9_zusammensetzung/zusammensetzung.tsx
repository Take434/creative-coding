import { ProjectDescription } from "@/components/project-description/project-description";
import { content } from "./description";

export function Zusammensetzung() {
  return (
    <>
      <iframe
        src="/3d-tiling-godot-export/index.html"
        style={{
          width: "100%",
          height: "90vh",
          border: "none",
        }}
        title="Godot Game"
      />
      <ProjectDescription {...content} />
    </>
  );
}
