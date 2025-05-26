/* Dropdown sub-menu */
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    toggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdownMenu.style.display =
            dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (e) {
        if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});

/* Dark mode */
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Save preference
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// Load preference on page load
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
});

/* Search bar */
const searchInput = document.getElementById("search-input");

if (searchInput && window.location.pathname.includes("articles.html")) {
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const headings = document.querySelectorAll("h3");
    const paragraphs = document.querySelectorAll("h3 + p");

    headings.forEach((heading, i) => {
      const text = heading.textContent.toLowerCase();
      const paragraph = paragraphs[i];

      const matches = text.includes(query);
      heading.style.display = matches ? "" : "none";
      if (paragraph) paragraph.style.display = matches ? "" : "none";
    });
  });
}

