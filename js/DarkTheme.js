const sunIcon = document.querySelector(".bx-sun");
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    sunIcon.classList.remove("bx-sun");
    sunIcon.classList.add("bx-moon");
} else {
    document.body.classList.remove("dark-theme");
    sunIcon.classList.remove("bx-moon");
    sunIcon.classList.add("bx-sun");
}

sunIcon.parentElement.addEventListener("click", () => {
    if (sunIcon.classList.contains("bx-sun")) {
        sunIcon.classList.remove("bx-sun");
        sunIcon.classList.add("bx-moon");
        document.body.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
    } else {
        sunIcon.classList.remove("bx-moon");
        sunIcon.classList.add("bx-sun");
        document.body.classList.remove("dark-theme");
        localStorage.setItem("theme", "light");
    }
});
