document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const resultsContainer = document.getElementById("search-results");
  const categoryFilters = document.getElementById("category-filters");
  const tagFilters = document.getElementById("tag-filters");
  const sortSelect = document.getElementById("sort-select");

  const CATEGORIES = [
    "Genes and Genomes",
    "Cells and Development",
    "Molecules and Medicine",
    "Neuroscience and Behavior",
    "Microbes and Immunity",
    "Biotech and the Future"
  ];

  const TAGS = [
    "AP Biology",
    "Topic Summary",
    "Case Study",
    "Spotlight"
  ];

  const tagClassMap = {
    "Genes and Genomes": "genes",
    "Cells and Development": "cells",
    "Molecules and Medicine": "molecules",
    "Neuroscience and Behavior": "neuro",
    "Microbes and Immunity": "immuno",
    "Biotech and the Future": "biotech",
    "AP Biology": "apbio",
    "Topic Summary": "summary",
    "Case Study": "case",
    "Spotlight": "spotlight"
  };

  let articles = [];

  fetch("articles.json")
    .then(res => res.json())
    .then(data => enrichWithFirebaseStats(data))
    .then(enriched => {
      articles = enriched;
      renderCheckboxes(CATEGORIES, categoryFilters, "category");
      renderCheckboxes(TAGS, tagFilters, "tag");
      applyFilters();
    });

  function renderCheckboxes(list, container, type) {
    list.forEach((item) => {
      const label = document.createElement("label");
      label.style.display = "block";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item;
      checkbox.dataset.filterType = type;
      label.appendChild(checkbox);
      label.append(` ${item}`);
      container.appendChild(label);
    });

    container.addEventListener("change", applyFilters);
  }

  function applyFilters() {
    const query = searchBar.value.toLowerCase().trim();
    const sortBy = sortSelect?.value || "newest";

    const selectedCategories = Array.from(
      categoryFilters.querySelectorAll("input[type=checkbox]:checked")
    ).map((c) => c.value);

    const selectedTags = Array.from(
      tagFilters.querySelectorAll("input[type=checkbox]:checked")
    ).map((t) => t.value);

    let filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(article.category);

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => article.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });

    filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date_raw) - new Date(a.date_raw);
      if (sortBy === "oldest") return new Date(a.date_raw) - new Date(b.date_raw);
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      if (sortBy === "likes-desc") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "comments-desc") return (b.comments || 0) - (a.comments || 0);
      if (sortBy === "views-desc") return (b.views || 0) - (a.views || 0);
      return 0;
    });

    renderResults(filtered);
  }

  function renderResults(articles) {
    resultsContainer.innerHTML = "";

    if (articles.length === 0) {
      resultsContainer.innerHTML = `<p class="empty-message">No articles found.</p>`;
      return;
    }

    articles.forEach((article) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.setAttribute("data-article-id", article.id);
      card.innerHTML = `
        <a href="${article.url}">
          <h3>${article.title}</h3>
          <div class="tag-container">
            ${article.tags.map((tag) => {
              const key = tagClassMap[tag] || tag.toLowerCase().replace(/\s/g, "-");
              return `<span class="tag tag-${key}">${tag}</span>`;
            }).join("")}
          </div>
          <p class="author-date">By ${article.author} · ${article.date}</p>
          <p class="excerpt">${article.excerpt}</p>
          <div class="card-reactions">
            <div class="reaction-item">❤️ <span class="like-count">${article.likes || 0}</span><span class="label">Likes</span></div>
            <div class="reaction-item">💬 <span class="comment-count">${article.comments || 0}</span><span class="label">Comments</span></div>
            <div class="reaction-item">👁️ <span class="view-count">${article.views || 0}</span><span class="label">Views</span></div>
          </div>
        </a>
      `;
      resultsContainer.appendChild(card);
    });
  }

  async function enrichWithFirebaseStats(articles) {
    const enriched = await Promise.all(articles.map(async (article) => {
      const docRef = db.collection("articles").doc(article.id);
      const doc = await docRef.get();

      let likes = 0;
      let views = 0;
      let comments = 0;

      if (doc.exists) {
        const data = doc.data();
        likes = data.likes || 0;
        views = data.views || 0;
      }

      const commentsSnapshot = await docRef.collection("comments").get();
      comments = commentsSnapshot.size;

      const replyCounts = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
        const replies = await doc.ref.collection("replies").get();
        return replies.size;
      }));
      comments += replyCounts.reduce((sum, c) => sum + c, 0);

      return {
        ...article,
        likes,
        views,
        comments
      };
    }));

    return enriched;
  }

  // Event listeners
  searchBar.addEventListener("input", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);

  document.getElementById("clear-category").addEventListener("click", () => {
    categoryFilters.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.checked = false;
    });
    applyFilters();
  });

  document.getElementById("clear-tags").addEventListener("click", () => {
    tagFilters.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.checked = false;
    });
    applyFilters();
  });
});
