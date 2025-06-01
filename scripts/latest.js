document.addEventListener("DOMContentLoaded", () => {
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
      "Spotlight": "spot"
    };
  
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
  });
  