document.addEventListener("DOMContentLoaded", () => {
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
  
    const authorContainer = document.getElementById("author-articles");
    const pageAuthor = document.body.dataset.author;
  
    if (authorContainer && pageAuthor) {
      fetch("/articles.json")
        .then(res => res.json())
        .then(articles => {
          const authored = articles
            .filter(a => a.author === pageAuthor)
            .sort((a, b) => new Date(b.date_raw) - new Date(a.date_raw));
  
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
  });
  