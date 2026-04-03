import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const lenis = new Lenis();
  let targetVelocity = 0;

  lenis.on("scroll", (e) => {
    targetVelocity = Math.abs(e.velocity) * 0.02;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Fixed: overflow → raf
  });

  gsap.ticker.lagSmoothing(0);

  // Text animation setup
  const textBlocks = gsap.utils.toArray(".copy-block p");
  const splitInstance = textBlocks.map((block) =>
    SplitText.create(block, {
      type: "words,lines",
      linesClass: "line-mask", 
    })
  );

  gsap.set(splitInstance[1].words, { yPercent: 100 });
  gsap.set(splitInstance[2].words, { yPercent: 100 });

  const overlapCount = 3;

  const getWordProgress = (phaseProgress, wordIndex, totalWords) => {
    const totalLength = 1 + overlapCount / totalWords;
    const scale =
      1 /
      Math.min(
        totalLength,
        1 + (totalLength - 1) / totalWords + overlapCount / totalWords
      );
    const startTime = (wordIndex / totalWords) * scale;
    const endTime = startTime + (overlapCount / totalWords) * scale;
    const duration = endTime - startTime;

    if (phaseProgress <= startTime) return 0;
    if (phaseProgress >= endTime) return 1;
    return (phaseProgress - startTime) / duration;
  };

  const animateBlock = (outBlock, inBlock, phaseProgress) => {
    outBlock.words.forEach((word, i) => {
      const progress = getWordProgress(phaseProgress, i, outBlock.words.length);
      gsap.set(word, { yPercent: progress * 100 });
    });

    inBlock.words.forEach((word, i) => {
      const progress = getWordProgress(phaseProgress, i, inBlock.words.length);
      gsap.set(word, { yPercent: 100 - progress * 100 });
    });
  };

  // Infinite marquee setup
  const indicator = document.querySelector(".scroll-indicator");
  const marqueeTrack = document.querySelector(".marquee-track");
  const items = gsap.utils.toArray(".marquee-item");

  // Clone items for seamless loop
  items.forEach((item) => {
    marqueeTrack.appendChild(item.cloneNode(true));
  });

  let marqueePosition = 0;
  let smoothVelocity = 0;

  // Get actual track width after cloning
  const getTrackWidth = () => {
    const firstItem = items[0];
    return firstItem.offsetWidth * items.length;
  };

  gsap.ticker.add(() => {
    // Smooth velocity interpolation
    smoothVelocity += (targetVelocity - smoothVelocity) * 0.5;

    // Base speed + scroll-based speed boost
    const baseSpeed = 0.45;
    const speed = baseSpeed + smoothVelocity * 9;

    marqueePosition -= speed;

    // Reset position for infinite loop
    const trackWidth = getTrackWidth();
    if (Math.abs(marqueePosition) >= trackWidth) {
      marqueePosition = 0;
    }

    gsap.set(marqueeTrack, { x: marqueePosition });

    // Dampen the target velocity
    targetVelocity *= 0.92;
  });

  ScrollTrigger.create({
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const scrollProgress = self.progress;

      if (indicator) {
        gsap.set(indicator, { "--progress": scrollProgress });
      }

      if (scrollProgress <= 0.5) {
        const phase1 = scrollProgress / 0.5;
        animateBlock(splitInstance[0], splitInstance[1], phase1);
      } else {
        const phase2 = (scrollProgress - 0.5) / 0.5;
        gsap.set(splitInstance[0].words, { yPercent: 100 });
        animateBlock(splitInstance[1], splitInstance[2], phase2);
      }
    },
  });
});
