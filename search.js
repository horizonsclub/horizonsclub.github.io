document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const resultsContainer = document.getElementById("search-results");
    const categoryFilters = document.getElementById("category-filters");
    const tagFilters = document.getElementById("tag-filters");
  
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
  
    let articles = [];
  
    // Load articles.json
    fetch("articles.json")
      .then((res) => res.json())
      .then((data) => {
        articles = data;
        renderCheckboxes(CATEGORIES, categoryFilters, "category");
        renderCheckboxes(TAGS, tagFilters, "tag");
        renderResults(articles);
      });
  
    // Create checkboxes
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
  
    // Filter logic
    function applyFilters() {
      const query = searchBar.value.toLowerCase().trim();
  
      const selectedCategories = Array.from(
        categoryFilters.querySelectorAll("input[type=checkbox]:checked")
      ).map((c) => c.value);
  
      const selectedTags = Array.from(
        tagFilters.querySelectorAll("input[type=checkbox]:checked")
      ).map((t) => t.value);
  
      const filtered = articles.filter((article) => {
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
  
      renderResults(filtered);
    }
  
    // Render article cards
    function renderResults(articles) {
      resultsContainer.innerHTML = "";
  
      if (articles.length === 0) {
        resultsContainer.innerHTML = `<p class="empty-message">No articles found.</p>`;
        return;
      }
  
      articles.forEach((article) => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.innerHTML = `
          <a href="${article.url}">
            <h3>${article.title}</h3>
            <div class="tag-container">
              ${article.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
            <p class="author-date">By ${article.author} · ${article.date}</p>
            <p class="excerpt">${article.excerpt}</p>
          </a>
        `;
        resultsContainer.appendChild(card);
      });
    }
  
    // Search bar listener
    searchBar.addEventListener("input", applyFilters);
  
    // Clear category filters
    document.getElementById("clear-category").addEventListener("click", () => {
      categoryFilters.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        cb.checked = false;
      });
      applyFilters();
    });
  
    // Clear tag filters
    document.getElementById("clear-tags").addEventListener("click", () => {
      tagFilters.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        cb.checked = false;
      });
      applyFilters();
    });
  });
  