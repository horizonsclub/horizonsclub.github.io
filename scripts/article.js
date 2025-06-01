document.addEventListener("DOMContentLoaded", () => {
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
  });
  
  // Helper to format timestamps
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
  