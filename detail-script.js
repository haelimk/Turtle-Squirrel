document.addEventListener("DOMContentLoaded", () => {

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
      creatorEl.textContent = item.creator || "작자 미상";
      synopsisEl.textContent = item.synopsis || "시놉시스가 제공되지 않았습니다.";

      // 임시 태그 로직을 삭제하고 실제 API 데이터를 사용
      tagsContainer.innerHTML = ''; 
      const tags = item.tags || []; // API에서 받은 tags 배열 사용

      if (tags.length > 0) {
        tags.forEach(tagText => {
          const tagEl = document.createElement('span');
          tagEl.className = 'tag';
          // API에서 받은 태그 텍스트에 #을 붙여서 표시
          tagEl.textContent = `#${tagText}`; 
          tagsContainer.appendChild(tagEl);
        });
      } else {
        // 태그가 없을 경우 기본 태그 표시
        tagsContainer.innerHTML = '<span class="tag">#기타</span>';
      }
      // ▲▲▲ 수정된 부분 ▲▲▲

      metaContainer.innerHTML = `
        <span class="meta-item"><i class="fa-solid fa-users-line"></i> ${item.headcount || "정보 없음"}</span>
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
  const resultsContainer = document.getElementById("hashtag-results-container");
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

    // API 호출 시 키워드, 페이징 파라미터 추가
    const fetchUrl = `${BASE_API_URL}/?keyword=${currentTag}&skip=${skip}&limit=${ITEMS_PER_PAGE}`;
    
    try {
      // 클라이언트 측 필터링을 제거하고, API가 필터링한 결과를 바로 사용
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("API 응답에 실패했습니다.");
      
      const filteredItems = await response.json();

      // 전체 아이템 개수를 헤더에서 가져오는 로직 (API가 지원하는 경우)
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
        const imageUrl = item.image || 'images/default1.webp';
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

    // 페이지네이션 활성화 상태 업데이트
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
  
  // 첫 페이지 로드
  fetchAndDisplayScenarios(1);
});