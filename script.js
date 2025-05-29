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

  // Load like and comment counts for article cards
  const cards = document.querySelectorAll(".article-card");
  console.log("Found article cards:", cards.length);

  cards.forEach(async (card) => {
    const articleId = card.getAttribute("data-article-id");
    const likeEl = card.querySelector(".like-count");
    const commentEl = card.querySelector(".comment-count");

    if (!articleId) return;
    console.log("Processing card for:", articleId);

    try {
      const docRef = db.collection("articles").doc(articleId);
      const doc = await docRef.get();
      if (doc.exists && likeEl) {
        likeEl.textContent = doc.data().likes || 0;
        console.log("Likes data:", doc.data().likes);
      }

      const commentsSnapshot = await docRef.collection("comments").get();
      if (commentEl) {
        commentEl.textContent = commentsSnapshot.size;
        console.log("Comments found:", commentsSnapshot.size);
      }
    } catch (err) {
      console.error("Error loading counts for", articleId, err);
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

// Get article ID (for full article pages)
const articleID = window.location.pathname
  .split("/")
  .pop()
  .replace(".html", "")
  .replace(/\W+/g, "_");

console.log("articleID:", articleID);
const likesRef = db.collection("articles").doc(articleID);

// Like button functionality
const likeButton = document.getElementById("like-button");
const likeCount = document.getElementById("like-count");
const userLikedKey = `liked-${window.location.pathname}`;
let liked = localStorage.getItem(userLikedKey) === "true";

if (likeButton && likeCount) {
  likesRef.get().then((doc) => {
    if (doc.exists) {
      likeCount.textContent = doc.data().likes || 0;
      if (liked) likeButton.classList.add("liked");
    } else {
      likesRef.set({ likes: 0 });
      likeCount.textContent = "0";
    }
  });

  likesRef.onSnapshot((doc) => {
    if (doc.exists) {
      likeCount.textContent = doc.data().likes || 0;
    }
  });

  likeButton.addEventListener("click", async () => {
    liked = !liked;
    likeButton.classList.toggle("liked");
    localStorage.setItem(userLikedKey, liked);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(likesRef);
        const currentLikes = doc.exists ? doc.data().likes || 0 : 0;
        const newLikes = currentLikes + (liked ? 1 : -1);
        transaction.set(likesRef, { likes: Math.max(newLikes, 0) }, { merge: true });
      });
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  });
}

const viewsRef = db.collection("articles").doc(articleID);

// Track views once per session
const viewedKey = `viewed-${articleID}`;
const hasViewed = sessionStorage.getItem(viewedKey);

if (!hasViewed) {
  sessionStorage.setItem(viewedKey, "true");

  viewsRef.update({ views: firebase.firestore.FieldValue.increment(1) })
    .catch(async (error) => {
      // If doc doesn't exist, create it with initial count
      if (error.code === "not-found") {
        await viewsRef.set({ views: 1 }, { merge: true });
      } else {
        console.error("Error updating views:", error);
      }
    });
}

// Display view count
viewsRef.get().then((doc) => {
  if (doc.exists && doc.data().views !== undefined) {
    const viewEl = document.getElementById("view-count");
    if (viewEl) viewEl.textContent = doc.data().views;
  }
});


// Comment functionality (only if present)
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const commentList = document.getElementById("comment-list");

if (commentForm && nameInput && textInput && commentList) {
  commentForm.addEventListener("submit", async (e) => {
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
}

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
