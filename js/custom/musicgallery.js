let coverflowInitialized = false;

const initializeCoverflow = () => {
  const coverflowContainer = document.querySelector(".coverflow");
  const viewAlbumButton = document.getElementById("view-album-button");

  if (!coverflowContainer || !viewAlbumButton) return;

  const images = Array.from(coverflowContainer.querySelectorAll(".coverflow__image"));
  const prevArrow = coverflowContainer.querySelector(".prev-arrow");
  const nextArrow = coverflowContainer.querySelector(".next-arrow");

  let currentPosition = calculateInitialPosition();

  // 计算初始位置
  function calculateInitialPosition() {
    const totalImages = images.length;
    return totalImages % 2 === 0 ? Math.floor(totalImages / 2) : Math.ceil(totalImages / 2);
  }

  // 重置样式
  const resetStyles = () => {
    images.forEach((img) => {
      img.style.transform = "scale(0)";
      img.style.opacity = "0";
      img.style.zIndex = "-1";
    });
    viewAlbumButton.classList.add("hidden");
    prevArrow.style.display = "none";
    nextArrow.style.display = "none";
  };

  // 更新 Coverflow 状态
  const updateCoverflow = () => {
    resetStyles();

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

    const currentImage = images[currentPosition - 1];
    if (currentImage) {
      viewAlbumButton.textContent = `View ${currentImage.alt}`;
      viewAlbumButton.classList.remove("hidden");
      viewAlbumButton.classList.add("visible");
      prevArrow.style.display = currentPosition === 1 ? "none" : "block";
      nextArrow.style.display = currentPosition === images.length ? "none" : "block";
    } else {
      viewAlbumButton.classList.remove("visible");
      viewAlbumButton.classList.add("hidden");
    }
  };

  const moveToPrev = () => {
    if (currentPosition > 1) {
      currentPosition--;
      updateCoverflow();
    }
  };

  const moveToNext = () => {
    if (currentPosition < images.length) {
      currentPosition++;
      updateCoverflow();
    }
  };

  const handleEventDelegation = (e) => {
    if (e.target.classList.contains("prev-arrow")) {
      moveToPrev();
    } else if (e.target.classList.contains("next-arrow")) {
      moveToNext();
    } else if (e.target.classList.contains("coverflow__image")) {
      const clickedIndex = images.indexOf(e.target);
      if (clickedIndex + 1 !== currentPosition) {
        currentPosition = clickedIndex + 1;
        updateCoverflow();
      }
    } else if (e.target.id === "view-album-button") {
      const currentImage = images[currentPosition - 1];
      alert(`Viewing ${currentImage.alt}`);
    }
  };

  resetStyles();
  updateCoverflow();

  prevArrow.addEventListener("click", moveToPrev);
  nextArrow.addEventListener("click", moveToNext);

  document.body.removeEventListener("click", handleEventDelegation);
  document.body.addEventListener("click", handleEventDelegation);

  coverflowContainer.classList.add("loaded"); // 加载完成后显示
};

const delayedInitializeCoverflow = () => {
  setTimeout(() => {
    if (!coverflowInitialized) {
      initializeCoverflow();
      coverflowInitialized = true;
    }
  }, 500); // 延迟 500ms
};

window.addEventListener("load", delayedInitializeCoverflow);

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.target.classList.contains("coverflow")) {
      delayedInitializeCoverflow();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});