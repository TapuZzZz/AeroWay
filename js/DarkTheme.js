alert("Script loaded!");

const sunIcon = document.querySelector(".bx-sun");


sunIcon.addEventListener("click", () => {
    
    if (sunIcon.classList.contains("bx-sun")) {
        sunIcon.classList.remove("bx-sun");
        sunIcon.classList.add("bx-moon");
    } else {
        sunIcon.classList.remove("bx-moon");
        sunIcon.classList.add("bx-sun");
    }

    document.body.classList.toggle("dark-theme");
});
