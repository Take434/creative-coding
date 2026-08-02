import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to use a physics engine, I chose matter js. At first I wanted to be able to shoot objects through a fog simulation, displacing the fog. But then I saw a youtube video about soft bodies and came up with the Idea for this project. Now you can drop soft bodies of random size and color onto each other. Sometimes they will connect or disconnect again and you can even spawn soft bodies inside of other soft bodies. This gets really interesting as soon as the whole floor is covered in bodies, then you can really start to see the behaviour of these soft bodies.",
  challenge:
    "Creating the soft bodies themselfs was quite the challenge since matter js does not really have anything for this. So I used normal bodies and connectors to create one soft body from a group of bodies and connectors. This also made finetuning the connector strength very important so that the bodies behaviour looked convincing.",
  good: "I really like how the soft bodies turned out, I think they look convincingly squishy and you can especially see this when dropping soft bodies onto other soft bodies. I also think its pretty interesting how they try to seperate when you spawn multiple bodies inside of each other.",
  usage:
    "Click anywhere on screen to spawn a randomly sized and colored soft body.",
};
