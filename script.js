// Apply dark mode before anything else
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark-mode");
  document.body.classList.add("dark-mode");
}

// Developer mode toggle (Ctrl+D or Cmd+D)
const DEV_MODE_KEY = "dev-mode-enabled";
function isDevModeEnabled() {
  return localStorage.getItem(DEV_MODE_KEY) === "true";
}
function toggleDevMode() {
  const enabled = isDevModeEnabled();
  localStorage.setItem(DEV_MODE_KEY, !enabled);
  location.reload();
}
document.addEventListener("keydown", (e) => {
  // Cmd+Shift+M to enter dev mode to be able to delete/moderate comments
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "m") {
    e.preventDefault();
    toggleDevMode();
  }
});
const isDevMode = isDevModeEnabled();

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

// Reactions
const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");
const pageKey = `likes-${window.location.pathname}`;
const likedKey = `liked-${window.location.pathname}`;
let likeTotal = parseInt(localStorage.getItem(pageKey)) || 0;
let liked = localStorage.getItem(likedKey) === "true";
if (likeCount) likeCount.textContent = likeTotal;
if (liked) likeButton?.classList.add("liked");
likeButton?.addEventListener("click", () => {
  liked = !liked;
  likeButton.classList.toggle("liked");
  likeTotal += liked ? 1 : -1;
  likeCount.textContent = likeTotal;
  localStorage.setItem(pageKey, likeTotal);
  localStorage.setItem(likedKey, liked);
});

// Comments
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");
const commentKey = `comments-${window.location.pathname}`;
let savedComments = JSON.parse(localStorage.getItem(commentKey)) || [];
savedComments.reverse().forEach(displayComment);
checkEmptyState();
commentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  if (!name || !text) return;
  const comment = {
    name,
    text,
    timestamp: new Date().toISOString(),
  };
  commentList.querySelector(".empty-message")?.remove();
  commentList.prepend(createCommentElement(comment));
  savedComments.push(comment);
  localStorage.setItem(commentKey, JSON.stringify(savedComments));
  nameInput.value = "";
  textInput.value = "";
});
function displayComment(comment) {
  commentList.appendChild(createCommentElement(comment));
}
function createCommentElement(comment) {
  const timestamp = comment.timestamp || new Date().toISOString();
  const timeFormatted = formatTimestamp(new Date(timestamp));
  const el = document.createElement("div");
  el.classList.add("comment");
  el.innerHTML = `
    <div class="name">${comment.name} <span class="timestamp">· ${timeFormatted}</span>
    ${isDevMode ? '<button class="delete-btn" style="margin-left:10px">🗑️</button>' : ''}</div>
    <div class="text">${comment.text}</div>
  `;
  if (isDevMode) {
    el.querySelector(".delete-btn").addEventListener("click", () => {
      el.remove();
      savedComments = savedComments.filter(
        (c) => !(c.name === comment.name && c.text === comment.text && c.timestamp === comment.timestamp)
      );
      localStorage.setItem(commentKey, JSON.stringify(savedComments));
      checkEmptyState();
    });
  }
  return el;
}
function checkEmptyState() {
  if (!commentList || commentList.children.length === 0) {
    commentList.innerHTML = `<p class="empty-message">No comments yet. Be the first to share your thoughts!</p>`;
  }
}
function formatTimestamp(date) {
  if (!(date instanceof Date) || isNaN(date)) return "just now";
  return date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " at");
}
