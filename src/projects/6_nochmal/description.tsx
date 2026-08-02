import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this Task we should visualize grammer. Thus the system has two parts, expanding the grammar to create a string and drawing that string using paper js. I also added randomness into the system drawing the grammar to make it more interesting. While drawing the system generates a random angle that is added to the angle that should be drawn to break up the clean pattern. To demonstrate this more clearly I have chosen a grammar that creates very clean boxes, this makes the random angles much more interesting.",
  challenge:
    "What I found hard was the expansion of the grammar string. At first I wanted to create a function that takes in the string and then uses recursion to expand it, but I was making that too complicated. Now I am just using a loop and an array of rules. Then I am splitting the string and replacing each character that has a rule with that rule, this is way simpler.",
  good: "I really like the random angle I added into the drawing of the grammer, this creates new artifacts each time even with a very structured grammar. And while I am not using a shader this time, the system is still very responsive so that the user can directly see the impact of the angle jitter slider.",
  usage:
    "There are two sliders to control the output, the angle jitter controls how strong the random angles added to the drawing can get. The repetitions control how far the grammar is expanded. You can also hit space bar to generate a new artifact with the same settings.",
};
