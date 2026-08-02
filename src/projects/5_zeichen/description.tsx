import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project I have thought alot about the interaction I could use. For some reason I could not get the idea of knocking on a door out of my head, but that does not really work well in the web. But I thought maybe instead of knocking, I could have the user wipe clean a foggy window. So here I am generating a 'fog' pattern in paper js and have the user wipe it of the screen. Beneath the pattern there is a 'zeichen' that can be found and after wiping a spot clean it refogs.",
  challenge:
    "One challenge I tried to solve differently at first was the wipe effect. I had the problem that the user could also wipe away the 'zeichen' they were supposed to find, at first I wanted to solve this via a mask, but now I am simply using two canvases above each other and wiping the upper one clean.",
  good: "I really like the refog effect, I think this is what ties the illusion together somehow. Without the refogging of the 'window' I dont think it would be clear what is happening here.",
  usage:
    "Use left click and drag to clean the 'window' from the fog and find the 'zeichen'",
};
