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
    // 운동명 다국어 변환
    const t = i18n[currentLang];
    const exerciseNameMap = {
      bench_press: t.bench,
      squat: t.squat,
      deadlift: t.deadlift,
    };
    resultExercise.textContent = `${t.resultExercise}: ${
      exerciseNameMap[selectedExercise] || selectedExercise
    }`;
    resultInputs.textContent = `${t.resultWeight}: ${weight}kg, ${t.resultReps}: ${reps}`;
    result1rm.textContent = `${t.result1rm}: ${oneRM}kg`;
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

  // 다국어 리소스
  const i18n = {
    ko: {
      title: "1RM 계산기",
      selectExercise: "운동 선택",
      weight: "무게(kg)",
      reps: "횟수",
      repsSelect: "선택",
      submit: "입력 완료",
      result: "예상 1RM 결과",
      share: "공유하기",
      errorSelectExercise: "운동을 선택해주세요.",
      errorWeight: "무게는 양수로 입력해주세요.",
      errorReps: "횟수는 1~10 중에서 선택해주세요.",
      bench: "벤치프레스",
      squat: "스쿼트",
      deadlift: "데드리프트",
      github: "깃허브",
      email: "이메일 문의",
      feedback: "피드백 남기기",
      resultExercise: "운동",
      resultWeight: "무게",
      resultReps: "횟수",
      result1rm: "예상 1RM",
    },
    en: {
      title: "1RM Calculator",
      selectExercise: "Select Exercise",
      weight: "Weight (kg)",
      reps: "Reps",
      repsSelect: "Select",
      submit: "Submit",
      result: "Estimated 1RM Result",
      share: "Share",
      errorSelectExercise: "Please select an exercise.",
      errorWeight: "Please enter a positive weight.",
      errorReps: "Please select reps between 1 and 10.",
      bench: "Bench Press",
      squat: "Squat",
      deadlift: "Deadlift",
      github: "GitHub",
      email: "Email",
      feedback: "Feedback",
      resultExercise: "Exercise",
      resultWeight: "Weight",
      resultReps: "Reps",
      result1rm: "Estimated 1RM",
    },
    ja: {
      title: "1RM計算機",
      selectExercise: "種目を選択",
      weight: "重量(kg)",
      reps: "回数",
      repsSelect: "選択",
      submit: "入力完了",
      result: "予想1RM結果",
      share: "共有",
      errorSelectExercise: "種目を選択してください。",
      errorWeight: "重量は正の数で入力してください。",
      errorReps: "回数は1～10の間で選択してください。",
      bench: "ベンチプレス",
      squat: "スクワット",
      deadlift: "デッドリフト",
      github: "ギットハブ",
      email: "メール",
      feedback: "フィードバック",
      resultExercise: "種目",
      resultWeight: "重量",
      resultReps: "回数",
      result1rm: "予想1RM",
    },
  };
  let currentLang = localStorage.getItem("lang") || "ko";
  const langSelect = document.getElementById("lang-select");

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    const t = i18n[lang];
    // 헤더/타이틀
    document.title = t.title + " - 최대 중량 쉽게 계산";
    document.querySelector("h1").textContent = t.title;
    // 운동 선택
    document.getElementById("exercise-heading").textContent = t.selectExercise;
    // 캐러셀 아이템
    const items = document.querySelectorAll(".carousel-item");
    const names = [t.bench, t.squat, t.deadlift];
    items.forEach((item, i) => {
      item.querySelector("span").textContent = names[i];
      item.querySelector("img").alt = names[i];
    });
    // 입력폼
    document.querySelector('label[for="weight"]').textContent = t.weight;
    document.querySelector('label[for="reps"]').textContent = t.reps;
    document
      .getElementById("weight")
      .setAttribute("aria-label", t.weight + " 입력");
    document
      .getElementById("reps")
      .setAttribute("aria-label", t.reps + " 선택");
    // 드롭다운 옵션
    const repsSelect = document.getElementById("reps");
    repsSelect.options[0].textContent = t.repsSelect;
    // 버튼
    document.querySelector('#input-form button[type="submit"]').textContent =
      t.submit;
    // 결과
    document.getElementById("result-heading").textContent = t.result;
    document.getElementById("share-btn").textContent = t.share;
    document.getElementById("share-btn").setAttribute("aria-label", t.share);
    // 푸터
    const footerLinks = document.querySelectorAll(".footer-links a");
    if (footerLinks.length === 3) {
      footerLinks[0].textContent = t.github;
      footerLinks[1].textContent = t.email;
      footerLinks[2].textContent = t.feedback;
    }
    // 언어 변경 시 결과 영역도 즉시 번역 반영
    if (resultSection.style.display !== "none") {
      const weight = weightInput.value.trim();
      const reps = Number(repsInput.value);
      const exerciseNameMap = {
        bench_press: t.bench,
        squat: t.squat,
        deadlift: t.deadlift,
      };
      resultExercise.textContent = `${t.resultExercise}: ${
        exerciseNameMap[selectedExercise] || selectedExercise
      }`;
      resultInputs.textContent = `${t.resultWeight}: ${weight}kg, ${t.resultReps}: ${reps}`;
      // 1RM 계산 (Epley 공식)
      if (weight && reps) {
        const oneRM = Math.round(Number(weight) * (1 + reps / 30));
        result1rm.textContent = `${t.result1rm}: ${oneRM}kg`;
      }
    }
  }
  // 언어 선택 이벤트
  langSelect.value = currentLang;
  langSelect.addEventListener("change", (e) => {
    setLang(e.target.value);
  });
  // 최초 적용
  setLang(currentLang);

  // 기존 에러 메시지 다국어화
  function showError(msgKey) {
    const t = i18n[currentLang];
    let msg = msgKey;
    if (
      msgKey === "운동을 선택해주세요." ||
      msgKey === "Please select an exercise." ||
      msgKey === "種目を選択してください。"
    )
      msg = t.errorSelectExercise;
    if (
      msgKey === "무게는 양수로 입력해주세요." ||
      msgKey === "Please enter a positive weight." ||
      msgKey === "重量は正の数で入力してください。"
    )
      msg = t.errorWeight;
    if (
      msgKey === "횟수는 1~10 중에서 선택해주세요." ||
      msgKey === "Please select reps between 1 and 10." ||
      msgKey === "回数は1～10の間で選択してください。"
    )
      msg = t.errorReps;
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

  // 3D 캐러셀 로직
  const carousel = document.querySelector(".carousel");
  const carouselItems = Array.from(document.querySelectorAll(".carousel-item"));
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let carouselIndex = 0;

  function updateCarousel() {
    const n = carouselItems.length;
    carouselItems.forEach((item, i) => {
      const angle = ((i - carouselIndex + n) % n) * 120;
      item.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(180px)`;
      item.classList.toggle("selected", i === carouselIndex);
      item.setAttribute(
        "aria-selected",
        i === carouselIndex ? "true" : "false"
      );
    });
    selectedExercise = carouselItems[carouselIndex].dataset.exercise;
    clearError();
  }
  prevBtn.addEventListener("click", () => {
    carouselIndex =
      (carouselIndex - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
  });
  nextBtn.addEventListener("click", () => {
    carouselIndex = (carouselIndex + 1) % carouselItems.length;
    updateCarousel();
  });
  // 캐러셀 아이템 클릭 시 선택
  carouselItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      carouselIndex = i;
      updateCarousel();
    });
  });
  // 초기 상태
  updateCarousel();

  // 키보드 접근성: 좌우 버튼, 캐러셀 아이템
  prevBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      prevBtn.click();
    }
  });
  nextBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      nextBtn.click();
    }
  });
  carouselItems.forEach((item, i) => {
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        carouselIndex = i;
        updateCarousel();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        carouselIndex =
          (carouselIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel();
        carouselItems[carouselIndex].focus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        carouselIndex = (carouselIndex + 1) % carouselItems.length;
        updateCarousel();
        carouselItems[carouselIndex].focus();
      }
    });
  });
});
