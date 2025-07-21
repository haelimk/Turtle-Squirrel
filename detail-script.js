document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 가져오기
  const detailContent = document.getElementById("scenario-detail-content");
  const imageEl = document.getElementById("scenario-image");
  const titleEl = document.getElementById("scenario-title");
  const creatorEl = document.getElementById("scenario-creator").querySelector("span");
  const tagsContainer = document.getElementById("scenario-tags-container");
  const synopsisEl = document.getElementById("scenario-synopsis-text");
  const metaContainer = document.getElementById("scenario-meta-container");

  // 1. URL에서 시나리오 ID 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const scenarioId = urlParams.get("id");

  if (!scenarioId) {
    detailContent.innerHTML = "<h1>잘못된 접근입니다.</h1><p>시나리오 ID가 필요합니다.</p>";
    return;
  }

  const API_URL = `https://turtleandsquirrel.onrender.com/scenarios/${scenarioId}`;

  // 2. API를 통해 특정 시나리오 데이터 가져오기
  async function fetchScenarioDetail() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const item = await response.json();

      // 3. 가져온 데이터로 페이지 내용 채우기
      document.title = `${item.title} - 거북이와 다람쥐`; 
      
      imageEl.src = item.image || 'images/default1.jpg';
      imageEl.alt = item.title;
      titleEl.textContent = item.title;
      creatorEl.textContent = item.creator || "작자 미상";
      synopsisEl.textContent = item.synopsis || "시놉시스가 제공되지 않았습니다.";

      // 태그 채우기 
      tagsContainer.innerHTML = ''; 
      // 만약 item.tags 배열이 있다면 아래와 같이 수정:
      // const tags = item.tags || [];
      const tags = (item.title.includes("추리") ? ["#추리"] : []).concat(
                     item.title.includes("현대") ? ["#현대"] : []); // 임시 
      if (tags.length > 0) {
        tags.forEach(tag => {
          const tagEl = document.createElement('span');
          tagEl.className = 'tag';
          tagEl.textContent = tag;
          tagsContainer.appendChild(tagEl);
        });
      } else {
        tagsContainer.innerHTML = '<span class="tag">#기타</span>';
      }

      // 메타 정보(인원, 시간 등) 채우기
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

  // 4. 스크립트 실행
  fetchScenarioDetail();
});