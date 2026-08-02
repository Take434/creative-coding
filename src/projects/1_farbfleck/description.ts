import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "The Theme of this project was 'Farbfleck' and I really wanted to do something with glsl shaders in Threejs. I had seen an interesting video about 'picking better colors' with the basic Idea of quantizing the colors in an image and mapping them to a fixed palette. I really wanted to achieve that here. I am displaying an animation using a shader, quantizing the lightness values and mapping the colors picked by the user onto the resulting image.",
  challenge:
    "The biggest challenge was the shader. I had very little experience with glsl and shaders before this so getting the shader to work was not simple. Also passing the colors picked by the user from the javascript to the webgl shader was not simple. Luckily Threejs allows you to pass uniforms to the shader so I am using a react hook to change the value of the passed uniform when the user manipulates the colors.",
  good: "I really like the quantization effect. By reducing the grayscale image generated from the shader to 8 specific values you get the effect that the circles merge together and split again. Without the quantization this just looks like the circles passing each other, but because with the effect it looks great.",
  usage:
    "You can change the colors used by the shader. You can either pick one color in the color picker which will then generate eight color swatches to create a monoton palette, or you can hit the 'Generate' button to create eight random colors",
};
