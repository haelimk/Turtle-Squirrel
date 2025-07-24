document.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("hashtag-results-container");
  const paginationContainer = document.getElementById("pagination-container");
  const titleElement = document.getElementById("hashtag-title");
  const naContainer = document.getElementById("na-container");

  const API_URL = "https://turtleandsquirrel.onrender.com/scenarios";
  const ITEMS_PER_PAGE = 20; //(5*4)

  let currentPage = 1;
  let allFilteredItems = [];

  // URL에서 'tag' 파라미터 값 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  let tag = urlParams.get("tag");

  if (!tag) {
    titleElement.textContent = "잘못된 접근입니다.";
    return;
  }
  

  tag = decodeURIComponent(tag);
  titleElement.textContent = `#${tag} 검색 결과`;
  document.title = `#${tag} - 거북이와 다람쥐`; //


  // API로 데이터 가져오기
  async function fetchAndDisplayScenarios() {
    // resultsContainer.innerHTML = "<p>시나리오를 불러오는 중입니다...</p>";
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API 응답에 실패했습니다.");
      
      const allItems = await response.json();
      

      allFilteredItems = allItems.filter(item => 
        (item.title && item.title.toLowerCase().includes(tag.toLowerCase())) ||
        (item.synopsis && item.synopsis.toLowerCase().includes(tag.toLowerCase()))
      );

      if (allFilteredItems.length === 0) {
        naContainer.innerHTML = `<p>#${tag} 태그를 포함하는 시나리오가 없습니다.</p>`;
        paginationContainer.innerHTML = ""; 
        return;
      }
      
      setupPagination();
      displayPage(currentPage);

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      resultsContainer.innerHTML = "<p>오류: 데이터를 불러오는 데 실패했습니다.</p>";
    }
  }


  function displayPage(page) {
    currentPage = page;
    resultsContainer.innerHTML = ""; 
    naContainer.innerHTML = "";

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsForPage = allFilteredItems.slice(start, end);

    itemsForPage.forEach(item => {
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


    document.querySelectorAll(".page-link").forEach(link => {
        link.classList.remove("active");
        if (parseInt(link.dataset.page) === currentPage) {
            link.classList.add("active");
        }
    });
  }

  //페이지네이션
  function setupPagination() {
    paginationContainer.innerHTML = "";
    const pageCount = Math.ceil(allFilteredItems.length / ITEMS_PER_PAGE);
    
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
            displayPage(i);
            window.scrollTo(0, 0); 
        });
        paginationContainer.appendChild(pageLink);
    }
  }

  fetchAndDisplayScenarios();
});