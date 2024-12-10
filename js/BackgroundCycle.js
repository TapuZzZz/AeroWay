const images = [
  '../img/background1.jpg',
  '../img/background2.jpg'
];

let currentIndex = localStorage.getItem('backgroundIndex') 
  ? parseInt(localStorage.getItem('backgroundIndex'), 10) 
  : 0;

const background1 = document.createElement('div');
const background2 = document.createElement('div');

[background1, background2].forEach(bg => {
  bg.style.position = 'fixed';
  bg.style.top = 0;
  bg.style.left = 0;
  bg.style.width = '100%';
  bg.style.height = '100%';
  bg.style.backgroundSize = 'cover';
  bg.style.backgroundPosition = 'center';
  bg.style.transition = 'opacity 2.5s ease-in-out';
  bg.style.zIndex = '-1'; 
  bg.style.opacity = '0'; 
});

background1.style.backgroundImage = `url(${images[currentIndex]})`;
background1.style.opacity = '1';

document.body.appendChild(background1);
document.body.appendChild(background2);

function changeBackground() {
  const nextIndex = (currentIndex + 1) % images.length;

  if (background1.style.opacity === '1') {
    background2.style.backgroundImage = `url(${images[nextIndex]})`;
    background2.style.zIndex = '-1';
    background1.style.zIndex = '-2';
    background2.style.opacity = '1';
    setTimeout(() => {
      background1.style.opacity = '0';
    }, 100);
  } else {
    background1.style.backgroundImage = `url(${images[nextIndex]})`;
    background1.style.zIndex = '-1';
    background2.style.zIndex = '-2';
    background1.style.opacity = '1';
    setTimeout(() => {
      background2.style.opacity = '0';
    }, 100);
  }

  currentIndex = nextIndex;

  localStorage.setItem('backgroundIndex', currentIndex);
}

setInterval(changeBackground, 5500);
