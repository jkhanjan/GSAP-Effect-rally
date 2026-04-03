import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText);

const lenis = new Lenis({infinite: true});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

const contactInfo = document.querySelector('.contact-info');
const contactRowMaxGap = window.innerWidth < 1000? 5: 10;

const nameText = document.querySelector('.contact-icon')
const split = new SplitText(nameText, {
  type: "chars"
});

const chars = split.chars;
const total = chars.length;


for(let i = 0; i < 1; i++){
    const clone = contactInfo.cloneNode(true);
    contactInfo.parentElement.appendChild(clone)
}

const contactVisual = document.querySelector('.contact-visual')
const contactRows = document.querySelectorAll('.contact-info-row')

function getVisualCenter(){
    return contactVisual.offsetTop + contactVisual.offsetHeight /2 ;
}
// console.log(contactRows)
contactRows.forEach((row) => {
  ScrollTrigger.create({
  trigger: row,
  start: () => `top+=${getVisualCenter() - 450} center`,
  end: () => `top+=${getVisualCenter() - 300} center`,
  scrub: true,
  markers: true,
  onUpdate: (self) => {

    const p = self.progress;

    // GAP animation (your existing logic)
    const symmetricProgress = 1 - Math.abs(1 - p * 2);
    const gap = 1 + (contactRowMaxGap - 1) * symmetricProgress;
    row.style.gap = `${gap}rem`;

    // 🔥 Letter reveal logic
    const visibleCount = Math.floor(p * total);

    chars.forEach((char, index) => {
      char.style.opacity = index < visibleCount ? 1 : 0;
    });

  }
});

});
