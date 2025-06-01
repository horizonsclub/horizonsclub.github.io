document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const resultsContainer = document.getElementById("search-results");
  const filterCheckboxes = document.getElementById("filter-checkboxes");
  const sortSelect = document.getElementById("sort-select");
  const loadMoreBtn = document.getElementById("load-more-btn");

  const FILTER_OPTIONS = [
    "Genes and Genomes",
    "Cells and Development",
    "Molecules and Medicine",
    "Neuroscience and Behavior",
    "Microbes and Immunity",
    "Biotech and the Future",
    "AP Biology",
    "Topic Summary",
    "Case Study",
    "Spotlight"
  ];

  let articles = [];
  let filteredResults = [];
  let currentDisplayIndex = 0;
  const ARTICLES_PER_PAGE = 10;

  fetch("articles.json")
    .then(res => res.json())
    .then(data => enrichWithFirebaseStats(data))
    .then(enriched => {
      articles = enriched;
      renderCheckboxes(FILTER_OPTIONS, filterCheckboxes);
      applyFilters();
    });

  function renderCheckboxes(list, container) {
    // Clear the container first before rendering new checkboxes
    container.innerHTML = '';

    list.forEach((item) => {
      const label = document.createElement("label");
      label.style.display = "block";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item;
      label.appendChild(checkbox);
      label.append(` ${item}`);
      container.appendChild(label);
    });

    // Add event listener after rendering the checkboxes
    container.addEventListener("change", applyFilters);
  }

  function applyFilters() {
    const query = searchBar.value.toLowerCase().trim();
    const sortBy = sortSelect?.value || "newest";

    const selectedFilters = Array.from(
      filterCheckboxes.querySelectorAll("input[type=checkbox]:checked")
    ).map((f) => f.value);

    let filtered = articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query);

      // Apply AND logic:
      // The article must match ALL of the selected filters
      const matchesCategoryAndTags = selectedFilters.every((filter) =>
        article.tags.includes(filter) || article.category === filter
      );

      return matchesSearch && matchesCategoryAndTags;
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

    filteredResults = filtered;
    currentDisplayIndex = 0;
    renderNextArticles();
  }

  function renderNextArticles() {
    const nextChunk = filteredResults.slice(currentDisplayIndex, currentDisplayIndex + ARTICLES_PER_PAGE);

    if (currentDisplayIndex === 0) {
      resultsContainer.innerHTML = ""; // Clear only on first render
    }

    nextChunk.forEach((article) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.setAttribute("data-article-id", article.id);
      card.innerHTML = `
        <a href="${article.url}">
          <h3>${article.title}</h3>
          <div class="tag-container">
            ${article.tags.map((tag) => {
              const key = tag.toLowerCase().replace(/\s/g, "-");
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

    currentDisplayIndex += ARTICLES_PER_PAGE;

    if (currentDisplayIndex >= filteredResults.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
    }
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
  loadMoreBtn.addEventListener("click", renderNextArticles);

  document.getElementById("clear-filters").addEventListener("click", () => {
    filterCheckboxes.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.checked = false;
    });
    applyFilters();
  });
});
