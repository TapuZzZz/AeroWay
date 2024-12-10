document.addEventListener('DOMContentLoaded', function () {
  ScrollReveal().reveal('.logo-name', {
    origin: 'top',
    distance: '40px',
    duration: 2000,
    delay: 50
  });

  ScrollReveal().reveal('.logo-img', {
    origin: 'left',
    distance: '40px',
    duration: 2000,
    delay: 50
  });

  ScrollReveal().reveal('nav ul li a', {
    origin: 'top',
    distance: '40px',
    duration: 2000,
    delay: 50
  });
});
