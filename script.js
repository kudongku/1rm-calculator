// script.js
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.init();
  }

  init() {
    // 시스템 설정 감지
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    // 저장된 테마 또는 시스템 설정 사용
    const savedTheme = localStorage.getItem("theme");
    const currentTheme = savedTheme || (prefersDark.matches ? "dark" : "light");

    this.setTheme(currentTheme);
    this.bindEvents();
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
  }

  bindEvents() {
    this.themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      this.setTheme(newTheme);
    });
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();

  // 운동 선택 상태
  let selectedExercise = null;
  const exerciseCards = document.querySelectorAll(".exercise-card");
  exerciseCards.forEach((card) => {
    card.addEventListener("click", () => {
      exerciseCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedExercise = card.dataset.exercise;
      clearError();
    });
  });

  // 입력 폼 검증
  const inputForm = document.getElementById("input-form");
  const weightInput = document.getElementById("weight");
  const repsInput = document.getElementById("reps");
  const errorMessage = document.getElementById("error-message");
  const resultSection = document.getElementById("result-section");
  const resultExercise = document.querySelector(".result-exercise");
  const resultInputs = document.querySelector(".result-inputs");
  const result1rm = document.querySelector(".result-1rm");
  const shareBtn = document.getElementById("share-btn");
  const shareMessage = document.getElementById("share-message");

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();
    const weight = weightInput.value.trim();
    const reps = Number(repsInput.value);

    if (!selectedExercise) {
      showError("운동을 선택해주세요.");
      hideResult();
      return;
    }
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      showError("무게는 양수로 입력해주세요.");
      hideResult();
      return;
    }
    if (!repsInput.value || !Number.isInteger(reps) || reps < 1 || reps > 10) {
      showError("횟수는 1~10 중에서 선택해주세요.");
      hideResult();
      return;
    }
    // 1RM 계산 (Epley 공식)
    const oneRM = Math.round(Number(weight) * (1 + reps / 30));
    // 운동명 한글 변환
    const exerciseNameMap = {
      bench_press: "벤치프레스",
      squat: "스쿼트",
      deadlift: "데드리프트",
    };
    resultExercise.textContent = `운동: ${
      exerciseNameMap[selectedExercise] || selectedExercise
    }`;
    resultInputs.textContent = `무게: ${weight}kg, 횟수: ${reps}`;
    result1rm.textContent = `예상 1RM: ${oneRM}kg`;
    showResult();
  });

  // 입력값 변경 시 결과 숨김
  weightInput.addEventListener("input", hideResult);
  repsInput.addEventListener("change", hideResult);

  // 공유 버튼 클릭 이벤트
  shareBtn.addEventListener("click", async () => {
    const params = new URLSearchParams({
      exercise: selectedExercise,
      weight: weightInput.value.trim(),
      reps: repsInput.value,
    });
    const shareUrl = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "1RM 계산 결과",
          text: "나의 1RM 계산 결과를 확인하세요!",
          url: shareUrl,
        });
        showShareMessage("공유가 완료되었습니다.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showShareMessage("링크가 복사되었습니다!");
      }
    } catch (e) {
      showShareMessage("공유에 실패했습니다. 다시 시도해주세요.", true);
    }
  });

  function showError(msg) {
    errorMessage.textContent = msg;
  }
  function clearError() {
    errorMessage.textContent = "";
  }

  function showResult() {
    resultSection.style.display = "block";
    setTimeout(() => {
      resultSection.classList.add("show");
    }, 10);
  }
  function hideResult() {
    resultSection.classList.remove("show");
    setTimeout(() => {
      resultSection.style.display = "none";
    }, 500);
  }

  // localStorage 저장
  function saveInputs() {
    const data = {
      exercise: selectedExercise,
      weight: weightInput.value.trim(),
      reps: repsInput.value,
    };
    localStorage.setItem("lastInputs", JSON.stringify(data));
  }

  // localStorage 불러오기
  function loadInputs() {
    const data = localStorage.getItem("lastInputs");
    if (!data) return;
    try {
      const { exercise, weight, reps } = JSON.parse(data);
      if (exercise) {
        const card = Array.from(
          document.querySelectorAll(".exercise-card")
        ).find((c) => c.dataset.exercise === exercise);
        if (card) card.click();
      }
      if (weight) weightInput.value = weight;
      if (reps) repsInput.value = reps;
    } catch {}
  }

  // URL 파라미터 처리
  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const exercise = params.get("exercise");
    const weight = params.get("weight");
    const reps = params.get("reps");
    let hasAny = false;
    if (exercise) {
      const card = Array.from(document.querySelectorAll(".exercise-card")).find(
        (c) => c.dataset.exercise === exercise
      );
      if (card) {
        card.click();
        hasAny = true;
      }
    }
    if (weight) {
      weightInput.value = weight;
      hasAny = true;
    }
    if (reps) {
      repsInput.value = reps;
      hasAny = true;
    }
    // 파라미터가 모두 있으면 자동 결과 표시
    if (exercise && weight && reps) {
      setTimeout(() => inputForm.requestSubmit(), 100);
    }
  }

  // 입력값 변경 시 localStorage 저장
  [weightInput, repsInput].forEach((el) =>
    el.addEventListener("input", saveInputs)
  );
  exerciseCards.forEach((card) => card.addEventListener("click", saveInputs));

  // 진입 시 localStorage/URL 파라미터 우선 적용
  loadInputs();
  loadFromUrl();
});
