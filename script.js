
document.addEventListener("DOMContentLoaded", () => {
  // ===== 햄버거 메뉴 =====
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav-menu");

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("active"); 
    });
  }
  
  // 검색창 
  const searchContainer = document.getElementById("search-container");
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");

  if (searchIcon && searchContainer) {
    searchIcon.addEventListener("click", (e) => {
      e.stopPropagation(); 
      searchContainer.classList.toggle("active");
      if (searchContainer.classList.contains("active")) {
        searchInput.focus(); 
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
        searchContainer.classList.remove("active");
    }
  });


  //탭컨텐츠
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");
      tabLinks.forEach((item) => item.classList.remove("active"));
      tabContents.forEach((item) => item.classList.remove("active"));

      link.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  //스와이퍼
  const swiper = new Swiper(".swiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
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

    // 불러올 때 
    if (cardContainer) {
      cardContainer.innerHTML = "<p>시나리오를 불러오는 중입니다...</p>";
    } else {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const items = await response.json();

      cardContainer.innerHTML = "";


      items.slice(0, limit).forEach((item) => {
        const rating = item.score || "N/A";
        const reviews = item.reviews || 0;
        const players = item.headcount || "-";
        const time = item.playtime || "-";
        const gm = item.gm || "-";

        const cardHTML = `
            <article class="card">
                <div class="card-image">
                    <img src="${item.image}" alt="${item.title}" />
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    ${
                      item.releaseDate
                        ? `<p class="date">${new Date(
                            item.releaseDate
                          ).toLocaleDateString("ko-KR")} 공개</p>`
                        : ""
                    }
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
        `;

        cardContainer.insertAdjacentHTML("beforeend", cardHTML);
      });
    } catch (error) {
      console.error(`Error fetching items for ${containerId}:`, error);
      cardContainer.innerHTML =
        '<p class="error-message">목록을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.</p>';
    }
  }

  const baseApiUrl = "https://turtleandsquirrel.onrender.com/scenarios";
  const popularApiUrl = "https://turtleandsquirrel.onrender.com/scenarios"; // 바꿔야함
  const recommendedApiUrl = "https://turtleandsquirrel.onrender.com/scenarios"; // 바꿔야함

  fetchAndDisplayItems(baseApiUrl, "new-scenarios-container", 5);
  fetchAndDisplayItems(popularApiUrl, "popular-scenarios-container", 5);
  fetchAndDisplayItems(
    recommendedApiUrl,
    "recommended-scenarios-container",
    5
  );
});