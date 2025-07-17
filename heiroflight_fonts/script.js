// Wait for the entire HTML document to be loaded and parsed
document.addEventListener("DOMContentLoaded", () => {
  // ===== Hamburger Menu Logic =====
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav-menu");

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("active"); // Use 'active' class consistent with CSS
    });
  }
  
  // ===== NEW: Search Bar Animation Logic =====
  const searchContainer = document.getElementById("search-container");
  const searchIcon = document.getElementById("search-icon");
  const searchInput = document.getElementById("search-input");

  if (searchIcon && searchContainer) {
    searchIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevents click from immediately closing
      searchContainer.classList.toggle("active");
      if (searchContainer.classList.contains("active")) {
        searchInput.focus(); // Automatically focus the input when opened
      }
    });
  }

  // Optional: Close search bar when clicking outside of it
  document.addEventListener("click", (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
        searchContainer.classList.remove("active");
    }
  });


  // ===== Tabbed Content Logic =====
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");

      // Deactivate all links and contents
      tabLinks.forEach((item) => item.classList.remove("active"));
      tabContents.forEach((item) => item.classList.remove("active"));

      // Activate the clicked link and corresponding content
      link.classList.add("active");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // ===== Swiper Initialization =====
  const swiper = new Swiper(".swiper", {
    // Optional parameters
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },

    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  // ================================================================
  // ===== NEW: Fetch and Display Items from API for Multiple Sections =====
  // ================================================================

  /**
   * Fetches data from a given API endpoint and displays a limited number of items in a specified container.
   * @param {string} apiUrl - The URL of the API to fetch data from.
   * @param {string} containerId - The ID of the container element to display the cards in.
   * @param {number} limit - The maximum number of items to display.
   */
  async function fetchAndDisplayItems(apiUrl, containerId, limit) {
    const cardContainer = document.getElementById(containerId);

    // Show a loading message while fetching
    if (cardContainer) {
      cardContainer.innerHTML = "<p>시나리오를 불러오는 중입니다...</p>";
    } else {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }

    try {
      const response = await fetch(apiUrl);
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const items = await response.json();

      // Clear the loading message
      cardContainer.innerHTML = "";

      // Loop through a limited number of items and create a card for each
      items.slice(0, limit).forEach((item) => {
        // Handle cases where a value might be missing
        const rating = item.score || "N/A";
        const reviews = item.reviews || 0;
        const players = item.headcount || "-";
        const time = item.playtime || "-";
        const gm = item.gm || "-";

        // Create the HTML for one card using a template literal
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

        // Add the new card HTML to the container
        cardContainer.insertAdjacentHTML("beforeend", cardHTML);
      });
    } catch (error) {
      console.error(`Error fetching items for ${containerId}:`, error);
      // Display an error message to the user
      cardContainer.innerHTML =
        '<p class="error-message">목록을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.</p>';
    }
  }

  // --- API Endpoints ---
  // 참고: 현재 모든 섹션이 동일한 API를 사용하고 있습니다.
  // 실제 환경에서는 각 섹션에 맞는 API 주소로 변경해주세요.
  const baseApiUrl = "https://turtleandsquirrel.onrender.com/scenarios";
  const popularApiUrl = "https://turtleandsquirrel.onrender.com/scenarios"; // 예: /scenarios/popular
  const recommendedApiUrl = "https://turtleandsquirrel.onrender.com/scenarios"; // 예: /scenarios/recommended

  // --- Call the function for each section ---
  fetchAndDisplayItems(baseApiUrl, "new-scenarios-container", 5);
  fetchAndDisplayItems(popularApiUrl, "popular-scenarios-container", 5);
  fetchAndDisplayItems(
    recommendedApiUrl,
    "recommended-scenarios-container",
    5
  );
}); // End of DOMContentLoaded