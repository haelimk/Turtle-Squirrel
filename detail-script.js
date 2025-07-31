document.addEventListener("DOMContentLoaded", () => {
  const detailContent = document.getElementById("scenario-detail-content");
  if (!detailContent) return; 

  const imageEl = document.getElementById("scenario-image");
  const titleEl = document.getElementById("scenario-title");
  const makerEl = document.querySelector("#scenario-creator span");
  const tagsContainer = document.getElementById("scenario-tags-container");
  const descriptionEl = document.getElementById("scenario-synopsis-text");
  const metaContainer = document.getElementById("scenario-meta-container");

  const urlParams = new URLSearchParams(window.location.search);
  const scenarioId = urlParams.get("id");

  if (!scenarioId) {
    detailContent.innerHTML = "<h1>잘못된 접근입니다.</h1><p>시나리오 ID가 필요합니다.</p>";
    return;
  }

  const API_URL = `https://turtleandsquirrel.onrender.com/scenarios/${scenarioId}`;

  async function fetchScenarioDetail() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const item = await response.json();

      document.title = `${item.title} - 거북이와 다람쥐`;

      imageEl.src = item.image || 'images/default1.jpg';
      imageEl.alt = item.title;
      titleEl.textContent = item.title;
      makerEl.textContent = item.maker || "작자 미상";
      descriptionEl.textContent = item.description || "시놉시스가 제공되지 않았습니다.";

      tagsContainer.innerHTML = '';
      const tags = item.tags || [];

      if (tags.length > 0) {
        tags.forEach(tagText => {
          // 상세 페이지의 태그를 클릭하면 검색 페이지로 이동하도록 a 태그로 만듭니다.
          const tagEl = document.createElement('a');
          tagEl.className = 'tag';
          tagEl.href = `sub.html?tag=${encodeURIComponent(tagText)}`; // 링크 추가
          tagEl.textContent = `#${tagText}`;
          tagsContainer.appendChild(tagEl);
        });
      } else {
        tagsContainer.innerHTML = '<span class="tag">#기타</span>';
      }

      metaContainer.innerHTML = `
        <span class="meta-item"><i class="fa-solid fa-users-line"></i> ${item.min_players || "정보 없음"}</span>
        <span class="meta-item"><i class="fa-solid fa-clock"></i> ${item.playtime || "정보 없음"}</span>
        <span class="meta-item"><i class="fa-solid fa-flag"></i> ${item.gm || "정보 없음"}</span>
      `;

    } catch (error) {
      console.error("Error fetching scenario detail:", error);
      detailContent.innerHTML = `<h1>오류 발생</h1><p>시나리오 정보를 불러오는 데 실패했습니다.</p>`;
    }
  }

  fetchScenarioDetail();
});


document.addEventListener("DOMContentLoaded", () => {
  // 해시태그 검색 페이지에만 존재하는 요소인지 확인하여 실행
  const resultsContainer = document.getElementById("hashtag-results-container");
  if (!resultsContainer) return; // 검색 페이지가 아니면 이 코드를 실행하지 않음

  const paginationContainer = document.getElementById("pagination-container");
  const titleElement = document.getElementById("hashtag-title");
  const naContainer = document.getElementById("na-container");

  const BASE_API_URL = "https://turtleandsquirrel.onrender.com/scenarios";
  const ITEMS_PER_PAGE = 20;

  let currentPage = 1;
  let currentTag = '';
  let totalItems = 0;

  const urlParams = new URLSearchParams(window.location.search);
  let tag = urlParams.get("tag");

  if (!tag) {
    titleElement.textContent = "잘못된 접근입니다.";
    return;
  }

  currentTag = decodeURIComponent(tag);
  titleElement.textContent = `#${currentTag} 검색 결과`;
  document.title = `#${currentTag} - 거북이와 다람쥐`;

  async function fetchAndDisplayScenarios(page = 1) {
    currentPage = page;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const fetchUrl = `${BASE_API_URL}/?keyword=${currentTag}&skip=${skip}&limit=${ITEMS_PER_PAGE}`;

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("API 응답에 실패했습니다.");

      const filteredItems = await response.json();

      if (page === 1) {
          const countResponse = await fetch(`${BASE_API_URL}/count?keyword=${currentTag}`);
          const countData = await countResponse.json();
          totalItems = countData.total;
      }

      if (totalItems === 0) {
        resultsContainer.innerHTML = "";
        naContainer.innerHTML = `<p>#${currentTag} 태그를 포함하는 시나리오가 없습니다.</p>`;
        paginationContainer.innerHTML = "";
        return;
      }

      displayPage(filteredItems);
      setupPagination();

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      resultsContainer.innerHTML = "<p>오류: 데이터를 불러오는 데 실패했습니다.</p>";
    }
  }

  function displayPage(items) {
    resultsContainer.innerHTML = "";
    naContainer.innerHTML = "";

    items.forEach(item => {
        const imageUrl = item.image || '/Turtle-Squirrel/images/default1.jpg';
        const cardHTML = `
          <a href="detail.html?id=${item.id}" class="card-link">
            <article class="card">
                <div class="card-image">
                    <img src="${imageUrl}" alt="${item.title}" />
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="icon-stats">
                        <span class="stat-item"><i class="fa-solid fa-users-line"></i> ${item.headcount || "-"}</span>
                        <span class="stat-item"><i class="fa-solid fa-clock"></i> ${item.playtime || "-"}</span>
                        <span class="stat-item"><i class="fa-solid fa-flag"></i> ${item.gm || "-"}</span>
                    </div>
                </div>
            </article>
          </a>
        `;
        resultsContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    document.querySelectorAll(".page-link").forEach(link => {
        link.classList.remove("active");
        if (parseInt(link.dataset.page) === currentPage) {
            link.classList.add("active");
        }
    });
  }

  function setupPagination() {
    paginationContainer.innerHTML = "";
    const pageCount = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {
        const pageLink = document.createElement("a");
        pageLink.className = "page-link";
        pageLink.textContent = i;
        pageLink.dataset.page = i;
        if (i === currentPage) {
            pageLink.classList.add("active");
        }

        pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            const newPage = parseInt(e.target.dataset.page);
            fetchAndDisplayScenarios(newPage);
            window.scrollTo(0, 0);
        });
        paginationContainer.appendChild(pageLink);
    }
  }

  fetchAndDisplayScenarios(1);
});