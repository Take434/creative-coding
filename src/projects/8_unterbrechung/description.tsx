import { type projectDescriptionContent } from "../../components/project-description/project-description";

export const content: projectDescriptionContent = {
  desc: "For this project we had to choose between a few different algorithms that we could use and interrupt. I chose the boids and I wanted to create a swarm of boids flying around a cube. Then I am breaking up the flock with 'explosions' that displace the boids. This was somewhat inspired by a Sebastian Lague video where he implemented boids flying around in a course he created. This is implemented in Threejs again.",
  challenge:
    "This whole project was quite difficult. Firstly, I had to implement all the physics myself, since I did not use any physics libraries, only three js. Secondly getting the boids to behave the way I wanted was really difficult. There are a few parameters to control their behaviour and configuring these correctly took quite some time. Also confining the boids to the inside of the cube was hard, since I had to add 'wall force' to my physics calculations that gets stronger the closer the boids come to the walls. Another thing were the explosions. At first I had them appear randomly, but oftentimes they did not even hit any boids, so now I am centering them on the boids themselfs. But the most challenging part was probably performance, the boids need to know about other neighboring boids to calculate their trajectory, so the naive approach is to loop over all other boids, but this is very inefficient (On^2) so I am seperating the cube into regions and have the boids loop over all other boids in the same region as them.",
  good: "I really like the boids swarm behaviour, it looks really satisfying how they reform after being broken up by an explosion. Also the explosion animation displacing the boids and ripping the flock apart looks really great.",
  usage:
    "The camera has orbiting controls (left click to orbit, right click to pan and mouse wheel to zoom).",
};
