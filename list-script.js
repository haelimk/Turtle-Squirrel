document.addEventListener("DOMContentLoaded", () => {
    const resultsContainer = document.getElementById("list-results-container");
    const paginationContainer = document.getElementById("pagination-container");
    const titleElement = document.getElementById("list-title");
    const naContainer = document.getElementById("na-container");

    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;
    let allItems = [];

    const categoryMap = {
        'new': { title: '신작 시나리오', url: 'https://turtleandsquirrel.onrender.com/scenarios/new/' },
        'popular': { title: '인기 시나리오', url: 'https://turtleandsquirrel.onrender.com/scenarios/popular/' },
        'recommended': { title: '추천 시나리오', url: 'https://turtleandsquirrel.onrender.com/scenarios/recommended/' }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    if (!category || !categoryMap[category]) {
        titleElement.textContent = "잘못된 접근입니다.";
        return;
    }

    const currentCategory = categoryMap[category];
    titleElement.textContent = currentCategory.title;
    document.title = `${currentCategory.title} - 거북이와 다람쥐`;

    async function fetchAndDisplayScenarios() {
        resultsContainer.innerHTML = "<p>시나리오를 불러오는 중입니다...</p>";
        try {
            const response = await fetch(currentCategory.url);
            if (!response.ok) throw new Error("API 응답에 실패했습니다.");
            
            allItems = await response.json();

            if (allItems.length === 0) {
                naContainer.innerHTML = `<p>해당 카테고리의 시나리오가 없습니다.</p>`;
                paginationContainer.innerHTML = "";
                resultsContainer.innerHTML = "";
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
        const itemsForPage = allItems.slice(start, end);

        itemsForPage.forEach(item => {
            const players = (item.min_players && item.max_players) ?
                (item.min_players === item.max_players ? `${item.min_players}` : `${item.min_players}~${item.max_players}`) :
                (item.min_players || item.max_players || '-');

            const cardHTML = `
              <a href="detail.html?id=${item.id}" class="card-link">
                <article class="card">
                    <div class="card-image">
                        <img src="${item.image || '/images/default1.jpg'}" alt="${item.title}" />
                    </div>
                    <div class="card-info">
                        <h3>${item.title}</h3>
                        <div class="icon-stats">
                            <span class="stat-item"><i class="fa-solid fa-users"></i> ${players}명</span>
                            <span class="stat-item"><i class="fa-solid fa-clock"></i> ${item.playtime || "-"}분</span>
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
        const pageCount = Math.ceil(allItems.length / ITEMS_PER_PAGE);
        
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
                displayPage(newPage);
                window.scrollTo(0, 0);
            });
            paginationContainer.appendChild(pageLink);
        }
    }

    fetchAndDisplayScenarios();
});