alert("Script loaded!");

const sunIcon = document.querySelector(".bx-sun");

// Add a click event listener to the sun icon
sunIcon.addEventListener("click", () => {
    // Toggle the icon class between sun and moon
    if (sunIcon.classList.contains("bx-sun")) {
        sunIcon.classList.remove("bx-sun");
        sunIcon.classList.add("bx-moon"); // Change to moon icon
    } else {
        sunIcon.classList.remove("bx-moon");
        sunIcon.classList.add("bx-sun"); // Change back to sun icon
    }

    document.body.classList.toggle("dark-theme");
});
