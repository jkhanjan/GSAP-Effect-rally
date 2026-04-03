import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const spotlightImgFinalPos = [
    [-140, -140],
    [40, -130],
    [-160, 40],
    [20, 30],
  ];

  const spotlightImages = document.querySelectorAll(".spotlight-image");

  ScrollTrigger.create({
    trigger: ".spotlight",
    start: "top top",
    end: `+=${window.innerHeight * 6}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      const initialRotations = [5, -3, 3.5, -1];
      const phaseOneStartOffsets = [0, 0.1, 0.2, 0.3];

      spotlightImages.forEach((img, index) => {
        const initialRotation = initialRotations[index];
        const phase1Start = phaseOneStartOffsets[index];
        const phase1End = phase1Start + 0.35; // Give each image time to animate

        let x = -50;
        let y, rotation;
        if (progress < phase1Start) {
          y = 200;
          rotation = initialRotation;
        } else if (progress <= phase1End) {
          const linearProgress =
            (progress - phase1Start) / (phase1End - phase1Start);
          const easedProgress = 1 - Math.pow(1 - linearProgress, 3);

          y = 200 - easedProgress * 250; 
          rotation = initialRotation;
        } else {
          y = -50;
          rotation = initialRotation;
        }

        const phaseTwoStartOffsets = [0.5, 0.6, 0.7, 0.8];
        const phase2Start = phaseTwoStartOffsets[index];
        const phase2End = phase2Start + 0.35;

        if (progress >= phase2Start && progress <= phase2End) {
          const finalX = spotlightImgFinalPos[index][0];
          const finalY = spotlightImgFinalPos[index][1];

          const linearProgress =
            (progress - phase2Start) / (phase2End - phase2Start);
          const easedProgress = 1 - Math.pow(1 - linearProgress, 3);

          x = -50 + (finalX + 50) * easedProgress;
          y = -50 + (finalY + 50) * easedProgress;
          rotation = initialRotation * (1 - easedProgress);
        } else if (progress > phase2End) {
          // Final position
          const finalX = spotlightImgFinalPos[index][0];
          const finalY = spotlightImgFinalPos[index][1];
          x = finalX;
          y = finalY;
          rotation = 0;
        }

        gsap.set(img, {
          transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)`,
        });
      });
    },
  });
});
