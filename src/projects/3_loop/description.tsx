import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we should create a looping animation. While I was initially struggeling to come up with a good idea, I then found an animation on social media I really wanted to recreate. I am using a shader again and displaying it using Threejs. I wanted to have a point travelling across the screen randomly and connecting to points in the background as if it was climbing along. The points movement is based on the sin and cosine functions and thus loops perfectly over time.",
  challenge:
    "Implementing this animation in glsl was really challenging. Since the fragment shader I am using is is executed for each point visible you really have to change how you think about drawing anything. Lines have to be drawn via clamp functions and especially the point grid was very hard to create. But once you get used to the way you have to think about drawing things in the fragment shader it gets easier.",
  good: "I really like how smooth the final animation looks. This is again due to the fact that I am using a shader to create it, it takes basically no performance at all and loops very well.",
  usage: "",
};
