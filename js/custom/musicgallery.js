const initializeCoverflow = () => {
  const coverflowContainer = document.querySelector(".coverflow");
  if (!coverflowContainer) return;

  const images = Array.from(coverflowContainer.querySelectorAll(".coverflow__image"));
  const prevArrow = coverflowContainer.querySelector(".prev-arrow");
  const nextArrow = coverflowContainer.querySelector(".next-arrow");

  let currentPosition;

  // 根据图片数量计算初始中心点
  const calculateInitialPosition = () => {
    const totalImages = images.length;
    if (totalImages % 2 === 0) {
      return Math.floor(totalImages / 2);
    } else {
      return Math.ceil(totalImages / 2);
    }
  };

  currentPosition = calculateInitialPosition();

  // 更新 Coverflow 状态
  const updateCoverflow = () => {
    coverflowContainer.dataset.coverflowPosition = currentPosition;

    images.forEach((img, index) => {
      const offset = index + 1 - currentPosition;
      const translateX = offset * 150;
      const scale = Math.max(0.8, 1 - Math.abs(offset) * 0.2);
      const rotateY = offset * -25;
      const opacity = Math.max(0.5, 1 - Math.abs(offset) * 0.3);
      const zIndex = 50 - Math.abs(offset) * 10;

      img.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;
      img.style.opacity = opacity;
      img.style.zIndex = zIndex;
    });

    prevArrow.style.display = currentPosition === 1 ? "none" : "block";
    nextArrow.style.display = currentPosition === images.length ? "none" : "block";
  };

  const moveToNext = () => {
    if (currentPosition < images.length) {
      currentPosition++;
      updateCoverflow();
    }
  };

  const moveToPrev = () => {
    if (currentPosition > 1) {
      currentPosition--;
      updateCoverflow();
    }
  };

  const moveToClickedImage = (clickedIndex) => {
    if (clickedIndex + 1 !== currentPosition) {
      currentPosition = clickedIndex + 1;
      updateCoverflow();
    }
  };

  updateCoverflow();

  // 移除可能的重复监听器
  prevArrow.removeEventListener("click", moveToPrev);
  nextArrow.removeEventListener("click", moveToNext);
  images.forEach((img) => img.removeEventListener("click", moveToClickedImage));

  // 添加事件监听
  prevArrow.addEventListener("click", moveToPrev);
  nextArrow.addEventListener("click", moveToNext);
  images.forEach((img, index) => {
    img.addEventListener("click", () => moveToClickedImage(index));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveToPrev();
    if (e.key === "ArrowRight") moveToNext();
  });
};

// 监听 DOM 内容加载完成
document.addEventListener("DOMContentLoaded", initializeCoverflow);

// 使用 MutationObserver 检测页面内容变化
const observer = new MutationObserver(() => {
  initializeCoverflow();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});