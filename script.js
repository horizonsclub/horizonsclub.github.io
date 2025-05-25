document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    toggleBtn.addEventListener("click", function (e) {
        e.stopPropagation(); // prevent the document click from closing it immediately
        dropdownMenu.style.display =
            dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (e) {
        if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});
