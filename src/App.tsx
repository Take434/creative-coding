import { ProjectPreview } from "./components/game-preview/ProjectPreview";
import type { ProjectPreviewProps } from "./types/ProjectPreviewProps";
import styx from "./assets/ProjectPreviewCovers/styx-cover.png";

function App() {
  const previews: ProjectPreviewProps[] = [
    {
      name: "Farbfleck",
      thumbnail: styx,
      description: "Cooles Project",
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

export default App;
