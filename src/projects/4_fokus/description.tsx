import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "The Theme of this project was 'Fokus' and we were Limited in the number of colors / shapes we could use. At first I thought about doing something with boolean operators and I got the Image of a solar ecplise stuck in my head. But then I thought maybe I could create a large 'planet' and have a lot of small objects cross in front of it. I though it might look calming to look at one large object in the background and feel the sense of perspective from the smaller objects crossing in front of it. This is implemented in Threejs again.",
  challenge:
    "Since this is not just one object with a shader, I had to keep performance in mind. One challenge for this was to delete the smaller spheres once they left the cameras view. This was not trivial, I had to create the cameras frustum based on the current projection and world matrix to be able to test whether the center of the sphere is still inside of it.",
  good: "I really like the feeling of perspective you get from this animation, at first glance it seems like a two dimensional animation, but while watching it becomes clear that this is actually a 3D scene in perspective.",
  usage:
    "You can use the same orbit controls for the camera as in 'Unwahrscheinlich' (orbit with left click, pan with right click and zoom with mouse wheel)",
};
