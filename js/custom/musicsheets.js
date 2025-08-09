const initializeCoverflowWithDelegation = () => {
  const coverflowContainer = document.querySelector(".coverflow");
  const albumButton = document.querySelector(".album-button");
  if (!coverflowContainer || !albumButton) return;

  let currentPosition;
  let images = [];

  const calculateInitialPosition = () => {
    const totalImages = images.length;
    return totalImages % 2 === 0 ? Math.floor(totalImages / 2) : Math.ceil(totalImages / 2);
  };

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

    // 更新按钮链接
    const activeImage = images[currentPosition - 1];
    if (activeImage) {
      const albumLink = activeImage.dataset.album || "#";
      console.log(`Album link for current image: ${albumLink}`);
      albumButton.setAttribute("data-album", albumLink);
      albumButton.onclick = () => {
        if (albumLink && albumLink !== "#") {
          window.open(albumLink, "_blank");
        } else {
          alert("No album link available for this image.");
        }
      };
    }

    const prevArrow = coverflowContainer.querySelector(".prev-arrow");
    const nextArrow = coverflowContainer.querySelector(".next-arrow");

    if (prevArrow && nextArrow) {
      prevArrow.style.display = currentPosition === 1 ? "none" : "block";
      nextArrow.style.display = currentPosition === images.length ? "none" : "block";
    }
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

  const handleCoverflowClick = (event) => {
    const target = event.target;

    if (target.classList.contains("prev-arrow")) {
      moveToPrev();
    } else if (target.classList.contains("next-arrow")) {
      moveToNext();
    } else if (target.classList.contains("coverflow__image")) {
      const clickedIndex = images.indexOf(target);
      if (clickedIndex !== -1) moveToClickedImage(clickedIndex);
    }
  };

  const initializeCoverflowImages = () => {
    images = Array.from(coverflowContainer.querySelectorAll(".coverflow__image"));
    currentPosition = calculateInitialPosition();
    updateCoverflow();
  };

  // 初始化 Coverflow 并绑定事件委托
  initializeCoverflowImages();
  coverflowContainer.addEventListener("click", handleCoverflowClick);

  // 监听键盘事件
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveToPrev();
    if (e.key === "ArrowRight") moveToNext();
  });

  // 如果有动态加载图片，可以用 MutationObserver 或手动调用重新初始化
  const observer = new MutationObserver(() => {
    initializeCoverflowImages();
  });

  observer.observe(coverflowContainer, { childList: true });
};

// 绑定到页面加载和页面迁移事件
document.addEventListener("DOMContentLoaded", initializeCoverflowWithDelegation);
document.addEventListener("pjax:success", initializeCoverflowWithDelegation); 