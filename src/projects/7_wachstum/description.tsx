import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to use an algorithm inspired by nature. I chose to use the fibonacci sequence can be found everywhere in nature. At first I wanted to create an animation of something looking like a black hole absorbing matter in a spiral pattern, but then I had the Idea to create the pattern from an explosion of points. I am using paper js to render my points which have a random radius and color, then I have all of them explode out from the middel of the screen. But they are attracted by the spiral pattern created by the fibonacci sequence so after some time the points settle into the spiral. The spiral is basically growing from the center out after the explosion.",
  challenge:
    "The challenge I had in this project was the collision of the points. Since I am just using paper js and no physiscs library I have to calculate all collisions and forces affecting the points myself. This is especially noticable when you increase the base point radius, since that means a lot more colliosions.",
  good: "I really like the effect of this animation, the points explode outward and look very chaotic, but then they suddenly snap into place and form the spiral pattern. It is also very satisfying to play around with the parameters and see how that effects the creation of the spiral.",
  usage: "",
};
