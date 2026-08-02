import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to use the webcam and track something with it. Since I really like the look of polaroid pictures, I came up with the idea to let the user take pictures in the webcam. I used ml5js to track the users hands and detect a 'click' to take the photo. This means the user can now use both their hands to create a frame and take a picture of that frame by clicking down one of their thumbs. Then these pictures are displayed like typical polaroids around the camera. This effect should resemble displaying polaroids on a pin wall or fridge.",
  challenge:
    "The hand tracking was the biggest challenge with this. While the tracking of the frame, created by thumb and pointer finger works really well, I have problems when taking the pictures. The 'click' aka the quick hiding of one thumb is also detected well, but since the thumb and pointer are what creates the frame, the frame shrinks in the moment the user takes a picture. This means that the frame in the actual photo is not the frame they had made previously. I mitigated this somewhat by creating a small timeout for the frame, meaning that the picture that is saved uses the frame from a few camera frames before, but this cant solve the issue completly since a high timeout means an unreactive frame when moving it around the camera. This is a limitation in my system.",
  good: "The tracking works really reliable, and I think especially the drawing of the frame by forming a real frame with your hands is a very satisfying interaction for the user.",
  usage:
    "This page needs access to you camera. Use both hands to form an L with you thumbs and pointer finger, then frame your picture and quickly hide one thumb by 'clicking' it down. You can download the pictures (without the borders) by right clicking them and selecting 'save as'",
};
