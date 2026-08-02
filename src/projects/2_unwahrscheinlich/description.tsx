import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we should create something using noise. My initial Idea was to create a terrain generator that uses noise to create a hilly landscape. The goal here was to render a cube in Threejs and then write my own vertex shader that displaces the top of the cube according to a noise function. This was not really easy, so I changed the Threejs object to a plane. I am then using my own vertex shader to displace the the vertices along the z axis and create waves on that plane. The displacement is controlled by the value of a perlin noise function implemented in glsl by Stefan Gustavson. I am also using uniforms to pass three variables to control the noise (roughness, speed, amplitude).",
  challenge:
    "The displacement was not really visible in the beginning because I used a solid plane and recalculating the planes normals after the noise displacement was very very hard. With incorrect normals the lighting of the plane is off and the displacement is not really visible. I solved this by activating the wireframe mode in Threejs since I could not get the normal calculation to work correctly.",
  good: "I really like how responsive it is. Since I am using a shader running on webgl I can scale up the plane a lot and still dont notice any lags or performance problems. The slider adjustments are also directly visible and it works well on mobile too.",
  usage: "",
};
