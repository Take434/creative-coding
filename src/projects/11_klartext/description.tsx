import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to create something with text. At first I really wanted to build a metal band logo generator that takes in any text and formats it like a metal band logo. Sadly this did not work at all, there is not really a pattern to the logos that I could generalize. Then I thought about smoke signs while watching 'Der Schuh des Manitu'. There is one scene where they smoke sign a folding chair and I though it might be fun to do something with that. So now I am using paper js to create 'smoke' that periodically forms the word entered by the user.",
  challenge:
    "The biggest challenge was performance, I am simulating 'smoke' with many small circles as particles. Since I am doing this in paper js on the CPU, performance is a big concern. Related to that, I had to guarantee that there is enough smoke on screen to form the text the user has entered, but I also should not have too much smoke unnecessarily. I solved this by adding and removing a fixed amount of particles for each character in the users text.",
  good: "I think the effect looks great, the text is legible, but still very clearly made up of the particles and not real text.",
  usage:
    "Enter some text in the text box above and watch it form in the smoke. You have to click out of the text box for the timer of the transformation to start.",
};
