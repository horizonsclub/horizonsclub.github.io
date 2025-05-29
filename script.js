// Apply dark mode before anything else
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
  document.body.classList.add("dark-mode");
}

document.addEventListener("DOMContentLoaded", () => {
  /* Dropdown toggle */
  const toggleBtn = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  toggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (
      dropdownMenu &&
      !dropdownMenu.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      dropdownMenu.style.display = "none";
    }
  });

  /* Dark mode toggle */
  const toggle = document.getElementById("theme-toggle");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  });

  /* Search bar filtering on articles.html */
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
});


// backtotop.js
const backToTopBtn = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// reactions.js

const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");

const pageKey = `likes-${window.location.pathname}`;
const likedKey = `liked-${window.location.pathname}`;

// Load saved values
let likeTotal = parseInt(localStorage.getItem(pageKey)) || 0;
let liked = localStorage.getItem(likedKey) === "true";

// Initialize UI
likeCount.textContent = likeTotal;
if (liked) likeButton.classList.add("liked");

// Toggle like on click
likeButton.addEventListener("click", () => {
  liked = !liked;
  likeButton.classList.toggle("liked");

  if (liked) {
    likeTotal++;
  } else {
    likeTotal--;
  }

  likeCount.textContent = likeTotal;

  // Save to localStorage
  localStorage.setItem(pageKey, likeTotal);
  localStorage.setItem(likedKey, liked);
});
