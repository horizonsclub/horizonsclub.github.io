// Apply dark mode before anything else
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
  document.body.classList.add("dark-mode");
}


document.addEventListener("DOMContentLoaded", () => {
  // Dropdown toggle
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

  // Dark mode toggle
  const toggle = document.getElementById("theme-toggle");
  toggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
  });

  // Search bar filtering on articles.html
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

// Back-to-top button
const backToTopBtn = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});
backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Like button (still localStorage-based)
const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");
const likeKey = `likes-${window.location.pathname}`;
const likedKey = `liked-${window.location.pathname}`;
let likeTotal = parseInt(localStorage.getItem(likeKey)) || 0;
let liked = localStorage.getItem(likedKey) === "true";

if (likeCount) likeCount.textContent = likeTotal;
if (liked) likeButton?.classList.add("liked");

likeButton?.addEventListener("click", () => {
  liked = !liked;
  likeButton.classList.toggle("liked");
  likeTotal += liked ? 1 : -1;
  likeCount.textContent = likeTotal;
  localStorage.setItem(likeKey, likeTotal);
  localStorage.setItem(likedKey, liked);
});

// Firebase comment system
// Get the current HTML file name without extension as article ID
const articleID = window.location.pathname
  .split("/")
  .pop()
  .replace(".html", "")
  .replace(/\W+/g, "_"); // optional: ensures it's Firestore-safe

console.log("articleID:", articleID); // just to verify


const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");

commentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  if (!name || !text) return;

  await db.collection("articles")
    .doc(articleID)
    .collection("comments")
    .add({ name, text, timestamp: new Date() });

  nameInput.value = "";
  textInput.value = "";
});

db.collection("articles")
  .doc(articleID)
  .collection("comments")
  .orderBy("timestamp", "asc")
  .onSnapshot((snapshot) => {
    commentList.innerHTML = "";
    if (snapshot.empty) {
      commentList.innerHTML = `<p class="empty-message">No comments yet. Be the first to share your thoughts!</p>`;
      return;
    }
    snapshot.forEach((doc) => {
      const data = doc.data();
      const commentEl = document.createElement("div");
      commentEl.classList.add("comment");
      commentEl.innerHTML = `
        <div class="name">${data.name} <span class="timestamp">· ${formatTimestamp(data.timestamp.toDate())}</span></div>
        <div class="text">${data.text}</div>
      `;
      commentList.appendChild(commentEl);
    });
  });

function formatTimestamp(date) {
  if (!(date instanceof Date) || isNaN(date)) return "just now";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " at");
}
