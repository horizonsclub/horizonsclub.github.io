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

// Shared logic to attach reactions (likes, comments, views)
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

// Logic for category-based article filtering in articles.html, genes.html, etc.
document.addEventListener("DOMContentLoaded", () => {
  const pageTags = document.body.dataset.tags.split(",");  // Get tags from data-tags attribute
  const articleContainer = document.getElementById("article-list");

  // Only run this if the article container and tags are set
  if (articleContainer && pageTags) {
    fetch("/articles.json")
      .then(res => res.json())
      .then(articles => {
        // Filter articles based on the current tags
        const filtered = articles.filter(article =>
          article.tags.some(tag => pageTags.includes(tag))  // Check if article contains any of the page's tags
        );

        // Sort articles by date (newest first)
        filtered.sort((a, b) => new Date(b.date_raw) - new Date(a.date_raw));

        // Clear the article container before appending
        articleContainer.innerHTML = "";

        // Render the filtered articles
        filtered.forEach(article => {
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
          articleContainer.appendChild(card);
        });

        attachReactionCounts(document.querySelectorAll(".article-card"));
      })
      .catch(err => {
        console.error("Error loading articles:", err);
        articleContainer.innerHTML = `<p class="empty-message">No articles found for this category.</p>`;
      });
  }
});
