import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProjectPreviewProps } from "../../types/ProjectPreviewProps";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function ProjectPreview({
  name,
  thumbnail,
  description,
  projectLink,
}: ProjectPreviewProps) {
  return (
    <Card>
      <img src={thumbnail} className="w-xs" />
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link to={projectLink} className="w-full">
          <Button className="w-full">View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
