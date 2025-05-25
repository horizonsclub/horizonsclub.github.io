
document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".dropdown-toggle");
    const menu = document.querySelector(".dropdown-menu");

    toggle.addEventListener("click", function () {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // Optional: Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = "none";
        }
    });
});
