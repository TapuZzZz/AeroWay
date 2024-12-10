document.addEventListener("DOMContentLoaded", () => {
    const letters = document.querySelectorAll("#logo-name span");
  
    function animateLetters() {
      letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.classList.add("animate");
  
          setTimeout(() => {
            letter.classList.remove("animate");
          }, 1000);
        }, index * 200);
      });
    }
  
    animateLetters();
  
    setInterval(() => {
      animateLetters();
    }, 10000);
  });
  