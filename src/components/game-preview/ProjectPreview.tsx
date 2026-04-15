import type { ProjectPreviewProps } from "../../types/ProjectPreviewProps";

export function ProjectPreview({
  name,
  thumbnail,
  description,
}: ProjectPreviewProps) {
  return (
    <div className="w-xs">
      <img src={thumbnail} />
      <p>{name}</p>
      <p>{description}</p>
    </div>
  );
}
