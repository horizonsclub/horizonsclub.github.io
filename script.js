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

  // Tag mapping
  const tagClassMap = {
    "Genes and Genomes": "genes",
    "Cells and Development": "cells",
    "Molecules and Medicine": "molecules",
    "Neuroscience and Behavior": "neuro",
    "Microbes and Immunity": "immuno",
    "Biotech and the Future": "biotech",
    "AP Biology": "apbio",
    "Topic Summary": "summary"
  };

  // Latest articles on index.html
  const latestArticlesContainer = document.getElementById("latest-articles");
  if (latestArticlesContainer) {
    fetch("articles.json")
      .then((res) => res.json())
      .then((articles) => {
        const latest = articles
          .sort((a, b) => new Date(b.date_raw) - new Date(a.date_raw))
          .slice(0, 4);

        latest.forEach((article) => {
          const tagHTML = article.tags.map(tag => {
            const key = tagClassMap[tag] || tag.toLowerCase().replace(/\s/g, "-");
            return `<span class="tag tag-${key}">${tag}</span>`;
          }).join("");

          const card = document.createElement("div");
          card.className = "article-card";
          card.setAttribute("data-article-id", article.id);
          card.innerHTML = `
            <a href="${article.url}">
              <h3>${article.title}</h3>
              <div class="tag-container">${tagHTML}</div>
              <p class="author-date">By ${article.author} · ${article.date}</p>
              <p class="excerpt">${article.excerpt}</p>
              <div class="card-reactions">
                <div class="reaction-item">❤️ <span class="like-count">0</span><span class="label">Likes</span></div>
                <div class="reaction-item">💬 <span class="comment-count">0</span><span class="label">Comments</span></div>
                <div class="reaction-item">👁️ <span class="view-count">0</span><span class="label">Views</span></div>
              </div>
            </a>
          `;
          latestArticlesContainer.appendChild(card);
        });

        attachReactionCounts(document.querySelectorAll(".article-card"));
      })
      .catch((err) => {
        console.error("Failed to load latest articles:", err);
        latestArticlesContainer.innerHTML = `<p class="empty-message">Unable to load latest articles.</p>`;
      });
  }

  // Articles by category (like genes.html)
  const articleContainer = document.getElementById("article-list");
  const pageCategory = document.body.dataset.category;

  if (articleContainer && pageCategory) {
    fetch("/articles.json")
      .then(res => res.json())
      .then(articles => {
        const filtered = articles
          .filter(a => a.category === pageCategory)
          .sort((a, b) => new Date(a.date_raw) - new Date(b.date_raw))
          .reverse();
        articleContainer.innerHTML = "";

        filtered.forEach(article => {
          const tagHTML = article.tags.map(tag => {
            const key = tagClassMap[tag] || tag.toLowerCase().replace(/\s/g, "-");
            return `<span class="tag tag-${key}">${tag}</span>`;
          }).join("");

          const el = document.createElement("div");
          el.className = "article-card";
          el.setAttribute("data-article-id", article.id);
          el.innerHTML = `
            <a href="${article.url}">
              <h3>${article.title}</h3>
              <div class="tag-container">${tagHTML}</div>
              <p class="author-date">By ${article.author} · ${article.date}</p>
              <p class="excerpt">${article.excerpt}</p>
              <div class="card-reactions">
                <div class="reaction-item">❤️ <span class="like-count">0</span><span class="label">Likes</span></div>
                <div class="reaction-item">💬 <span class="comment-count">0</span><span class="label">Comments</span></div>
                <div class="reaction-item">👁️ <span class="view-count">0</span><span class="label">Views</span></div>
              </div>
            </a>
          `;
          articleContainer.appendChild(el);
        });

        attachReactionCounts(document.querySelectorAll(".article-card"));
      })
      .catch(err => {
        console.error("Error loading articles:", err);
        articleContainer.innerHTML = `<p class="empty-message">Articles failed to load.</p>`;
      });
  }

  // Author profile pages (like matthew-chang.html)
  const authorContainer = document.getElementById("author-articles");
  const pageAuthor = document.body.dataset.author;

  if (authorContainer && pageAuthor) {
    fetch("/articles.json")
      .then(res => res.json())
      .then(articles => {
        const authored = articles
          .filter(a => a.author === pageAuthor)
          .sort((a, b) => new Date(a.date_raw) - new Date(b.date_raw))
          .reverse(); // now descending (latest at top)
        authorContainer.innerHTML = "";

        authored.forEach(article => {
          const tagHTML = article.tags.map(tag => {
            const key = tagClassMap[tag] || tag.toLowerCase().replace(/\s/g, "-");
            return `<span class="tag tag-${key}">${tag}</span>`;
          }).join("");

          const card = document.createElement("div");
          card.className = "article-card";
          card.setAttribute("data-article-id", article.id);
          card.innerHTML = `
            <a href="${article.url}">
              <h3>${article.title}</h3>
              <div class="tag-container">${tagHTML}</div>
              <p class="author-date">By ${article.author} · ${article.date}</p>
              <p class="excerpt">${article.excerpt}</p>
              <div class="card-reactions">
                <div class="reaction-item">❤️ <span class="like-count">0</span><span class="label">Likes</span></div>
                <div class="reaction-item">💬 <span class="comment-count">0</span><span class="label">Comments</span></div>
                <div class="reaction-item">👁️ <span class="view-count">0</span><span class="label">Views</span></div>
              </div>
            </a>
          `;
          authorContainer.appendChild(card);
        });

        attachReactionCounts(document.querySelectorAll(".article-card"));
      })
      .catch(err => {
        console.error("Error loading authored articles:", err);
        authorContainer.innerHTML = `<p class="empty-message">Articles failed to load.</p>`;
      });
  }

  // Fallback attach reactions
  const looseCards = document.querySelectorAll(".article-card[data-article-id]");
  if (looseCards.length) {
    attachReactionCounts(looseCards);
  }
});

// 🔁 Shared logic: define globally
async function attachReactionCounts(cards) {
  for (const card of cards) {
    const articleId = card.getAttribute("data-article-id");
    const likeEl = card.querySelector(".like-count");
    const commentEl = card.querySelector(".comment-count");
    const viewEl = card.querySelector(".view-count");

    if (!articleId) continue;

    try {
      const docRef = db.collection("articles").doc(articleId);
      const doc = await docRef.get();

      if (doc.exists && likeEl) likeEl.textContent = doc.data().likes || 0;

      const commentsSnapshot = await docRef.collection("comments").get();
      let totalCount = commentsSnapshot.size;

      const replyCounts = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
        const replies = await doc.ref.collection("replies").get();
        return replies.size;
      }));

      totalCount += replyCounts.reduce((sum, c) => sum + c, 0);

      if (commentEl) commentEl.textContent = totalCount;
      if (viewEl && doc.exists && doc.data().views !== undefined) {
        viewEl.textContent = doc.data().views;
      }
    } catch (err) {
      console.error("Error loading counts for", articleId, err);
    }
  }
}



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

// Get article ID
const articleID = new URLSearchParams(window.location.search).get("id");

const likesRef = db.collection("articles").doc(articleID);
const viewsRef = db.collection("articles").doc(articleID);

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

// Track views once per session
const viewedKey = `viewed-${articleID}`;
const hasViewed = sessionStorage.getItem(viewedKey);

if (!hasViewed) {
  sessionStorage.setItem(viewedKey, "true");

  viewsRef.update({ views: firebase.firestore.FieldValue.increment(1) })
    .catch(async (error) => {
      if (error.code === "not-found") {
        await viewsRef.set({ views: 1 }, { merge: true });
      } else {
        console.error("Error updating views:", error);
      }
    });
}

// Display view count on full article page
viewsRef.get().then((doc) => {
  if (doc.exists && doc.data().views !== undefined) {
    const viewEl = document.getElementById("view-count");
    if (viewEl) viewEl.textContent = doc.data().views;
  }
});

// Comment system
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
    .orderBy("timestamp", "desc")
    .onSnapshot(async (snapshot) => {
      commentList.innerHTML = "";

      const commentCounter = document.querySelector(".comment-count");
      if (commentCounter) {
        let total = snapshot.size;

        const replyCounts = await Promise.all(snapshot.docs.map(async (doc) => {
          const replies = await doc.ref.collection("replies").get();
          return replies.size;
        }));

        total += replyCounts.reduce((sum, c) => sum + c, 0);
        commentCounter.textContent = total;
      }

      if (snapshot.empty) {
        commentList.innerHTML = `<p class="empty-message">No comments yet. Be the first to share your thoughts!</p>`;
        return;
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        const commentEl = document.createElement("div");
        const replyBoxID = `reply-box-${doc.id}`;

        commentEl.classList.add("comment");
        commentEl.innerHTML = `
          <div class="name">${data.name} <span class="timestamp">· ${formatTimestamp(data.timestamp.toDate())}</span></div>
          <div class="text">${data.text}</div>
          <button class="reply-btn" data-id="${doc.id}">Reply</button>
          <div class="reply-form hidden" id="${replyBoxID}">
            <input type="text" class="reply-name" placeholder="Your name" />
            <textarea class="reply-text" placeholder="Write your reply..."></textarea>
            <button class="submit-reply" data-id="${doc.id}">Post Reply</button>
          </div>
          <div class="replies" id="replies-${doc.id}"></div>
        `;

        commentList.appendChild(commentEl);

        const repliesContainer = commentEl.querySelector(`#replies-${doc.id}`);
        doc.ref.collection("replies")
          .orderBy("timestamp", "asc")
          .onSnapshot((replySnap) => {
            repliesContainer.innerHTML = "";
            replySnap.forEach((replyDoc) => {
              const reply = replyDoc.data();
              const replyEl = document.createElement("div");
              replyEl.classList.add("reply");
              replyEl.innerHTML = `
                <div class="name">${reply.name} <span class="timestamp">· ${formatTimestamp(reply.timestamp.toDate())}</span></div>
                <div class="text">${reply.text}</div>
              `;
              repliesContainer.appendChild(replyEl);
            });
          });
      });

      // Attach reply logic after rendering
      setTimeout(() => {
        document.querySelectorAll(".reply-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const box = document.getElementById(`reply-box-${btn.dataset.id}`);
            box.classList.toggle("hidden");
          });
        });

        document.querySelectorAll(".submit-reply").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const commentID = btn.dataset.id;
            const form = btn.closest(".reply-form");
            const name = form.querySelector(".reply-name").value.trim();
            const text = form.querySelector(".reply-text").value.trim();
            if (!name || !text) return;

            await db.collection("articles")
              .doc(articleID)
              .collection("comments")
              .doc(commentID)
              .collection("replies")
              .add({ name, text, timestamp: new Date() });

            form.querySelector(".reply-name").value = "";
            form.querySelector(".reply-text").value = "";
            form.classList.add("hidden");
          });
        });
      }, 100);
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

document.querySelectorAll(".share-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const relativeUrl = btn.getAttribute("data-url");
    const fullUrl = `${window.location.origin}${relativeUrl}`;

    if (navigator.share) {
      // ✅ Native share on mobile/modern browsers
      try {
        await navigator.share({
          title: document.title,
          url: fullUrl,
        });
        console.log("Shared successfully!");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // ✨ Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Couldn't copy the link.");
      }
    }
  });
});
