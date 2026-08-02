import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type projectDescriptionContent = {
  desc: string;
  challenge: string;
  good: string;
  usage?: string;
};

export function ProjectDescription(content: projectDescriptionContent) {
  return (
    <>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-fit absolute top-20 right-5">
              Project Description
            </Button>
          }
        />
        <PopoverContent align="start" className="w-[30vw]">
          <h2 className="font-bold">Description</h2>
          <div>{content.desc}</div>
          <hr />
          <h2 className="font-bold">This was especially tricky</h2>
          <div>{content.challenge}</div>
          <hr />
          <h2 className="font-bold">I like this especially well</h2>
          <div>{content.good}</div>
          {content.usage && (
            <>
              <hr />
              <h2 className="font-bold">Usage Instructions</h2>
              <div>{content.usage}</div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
