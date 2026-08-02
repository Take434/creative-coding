import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to create a dithering algorithim that does not use pixel. I instantly thought about ascii art and dithering using symbols. But then I thought that I needed some element of randomness and I had the idea to use small stars for dithering. I am now dithering with points, but each point is a randomly generated star with a different amount of spikes and a different rotation. The Size of the stars is determined by the brightness of the image uploaded by the user.",
  challenge:
    "At first I wanted to implement the dithering effect as a shader again, but sending the uploaded image to the gpu, and then placing the small random stars based on the lightness was very complicated. Instead I chose to implement the relatively simple stipple algorithm, but that also means the dithering happens on the CPU and performance is an issue.",
  good: "I really like the dithered result, it is suprising how well you can still recognize the image even when everything is replaced by small stars. I also thing the randomness of the stars helps to make the final image more interesting.",
  usage:
    "Upload an image. You can then adjust the sliders however you like. To download the image, you need to rightclick the canvas and select 'save as'",
};
