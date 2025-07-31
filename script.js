document.addEventListener("DOMContentLoaded", () => {

   const loadingOverlay = document.getElementById('loading-overlay');
  
  const loadingTextContainer = document.getElementById('loading-text');
  const text = "로딩 중..";

  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    
    if (char === ' ') {
      span.style.padding = '0 0.2em'; 
    }

    span.style.animationDelay = `${index * 0.1}s`; 
    loadingTextContainer.appendChild(span);
  });

  // ================================================================
  // ===== API =====
  // ================================================================

  /**
   * @param {string} apiUrl - API URL
   * @param {string} containerId - 보일제품의 ID
   * @param {number} limit - 노출 최대 수
   */
  async function fetchAndDisplayItems(apiUrl, containerId, limit) {

    const cardContainer = document.getElementById(containerId);

    if (cardContainer) {
      cardContainer.innerHTML = "<p>시나리오를 불러오는 중입니다...</p>";
    } else {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}?skip=0&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const items = await response.json();
      cardContainer.innerHTML = "";

      items.forEach((item) => {
        const rating = item.score || "N/A";
        const reviews = item.reviews || 0;
        const players = item.headcount || "-";
        const time = item.playtime || "-";
        const gm = item.gm || "-";
        const imageUrl = item.image || '/Turtle-Squirrel/images/default1.jpg';

        const cardHTML = `
            <a href="detail.html?id=${item.id}" class="card-link">
              <article class="card">
                  <div class="card-image">
                      <img src="${imageUrl}" alt="${item.title}" />
                  </div>
                  <div class="card-info">
                      <h3>${item.title}</h3>
                      ${item.releaseDate ? `<p class="date">${new Date(item.releaseDate).toLocaleDateString("ko-KR")} 공개</p>` : ""}
                      <div class="pills">
                          <span class="pill"><i class="fas fa-star"></i> ${rating}</span>
                          <span class="pill"><i class="fas fa-user"></i> ${reviews}</span>
                      </div>
                      <div class="icon-stats">
                          <span class="stat-item"><i class="fa-solid fa-users-line"></i> ${players}</span>
                          <span class="stat-item"><i class="fa-solid fa-clock"></i> ${time}</span>
                          <span class="stat-item"><i class="fa-solid fa-flag"></i> ${gm}</span>
                      </div>
                  </div>
              </article>
            </a>
        `;
        cardContainer.insertAdjacentHTML("beforeend", cardHTML);
      });
    } catch (error) {
      console.error(`Error fetching items for ${containerId}:`, error);
      cardContainer.innerHTML = '<p class="error-message">목록을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.</p>';
    }
  }

  /**
   * @param {string} apiUrl - Tags API URL
   * @param {string} containerId - 태그를 표시할 컨테이너의 ID
   * @param {number} limit - 노출할 최대 태그 수
   */
  async function fetchAndDisplayTags(apiUrl, containerId, limit) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }
    container.innerHTML = '<p>태그를 불러오는 중입니다...</p>';

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const tags = await response.json();
      container.innerHTML = '';

      const shuffledTags = tags.sort(() => 0.5 - Math.random());
      const selectedTags = shuffledTags.slice(0, limit);
      // --- ---

      selectedTags.forEach(tag => {
        const tagName = tag; 
        const tagHTML = `<a href="sub.html?tag=${tagName}" class="hashtag">#${tagName}</a>`;
        container.insertAdjacentHTML('beforeend', tagHTML);
      });

    } catch (error) {
      console.error(`Error fetching tags for ${containerId}:`, error);
      container.innerHTML = '<p class="error-message">태그를 불러오는 데 실패했습니다.</p>';
    }
  }

  const baseApiUrl = "https://turtleandsquirrel.onrender.com/scenarios";
  const tagsApiUrl = "https://turtleandsquirrel.onrender.com/tags";
  
  const newApiUrl = `${baseApiUrl}/new/`;
  const popularApiUrl = `${baseApiUrl}/popular/`;
  const recommendedApiUrl = `${baseApiUrl}/recommended/`;
  
  async function loadAllData() {
    try {
      await Promise.all([
        fetchAndDisplayItems("https://turtleandsquirrel.onrender.com/scenarios/new/", "new-scenarios-container", 5),
        fetchAndDisplayItems("https://turtleandsquirrel.onrender.com/scenarios/popular/", "popular-scenarios-container", 5),
        fetchAndDisplayItems("https://turtleandsquirrel.onrender.com/scenarios/recommended/", "recommended-scenarios-container", 5),
        fetchAndDisplayTags("https://turtleandsquirrel.onrender.com/tags", "tags-container", 8)
      ]);
    } catch (error) {
      console.error("페이지 데이터를 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      loadingOverlay.style.display = 'none';
    }
  }

  loadAllData();

  fetchAndDisplayItems(newApiUrl, "new-scenarios-container", 5);
  fetchAndDisplayItems(popularApiUrl, "popular-scenarios-container", 5);
  fetchAndDisplayItems(
    recommendedApiUrl,
    "recommended-scenarios-container",
    5
  );


  fetchAndDisplayTags(tagsApiUrl, "tags-container", 8);
});