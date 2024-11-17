const initializeCoverflow = () => {
  const coverflowContainer = document.querySelector(".coverflow");
  const albumButton = document.querySelector(".album-button");
  if (!coverflowContainer || !albumButton) return;

  const images = Array.from(coverflowContainer.querySelectorAll(".coverflow__image"));
  const maxImages = 5; // 限制最多加载 5 张图片
  const limitedImages = images.slice(0, maxImages); // 获取前 5 张图片
  const prevArrow = coverflowContainer.querySelector(".prev-arrow");
  const nextArrow = coverflowContainer.querySelector(".next-arrow");

  let currentPosition;

  const calculateInitialPosition = () => {
    const totalImages = limitedImages.length;
    return totalImages % 2 === 0 ? Math.floor(totalImages / 2) : Math.ceil(totalImages / 2);
  };

  currentPosition = calculateInitialPosition();

  const updateCoverflow = () => {
    coverflowContainer.dataset.coverflowPosition = currentPosition;

    limitedImages.forEach((img, index) => {
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
    const activeImage = limitedImages[currentPosition - 1];
    if (activeImage) {
      const albumLink = activeImage.dataset.album || "#";
      console.log(`Album link for current image: ${albumLink}`); // 检查链接是否正确
      albumButton.setAttribute("data-album", albumLink);
      albumButton.onclick = () => {
        if (albumLink && albumLink !== "#") {
          window.open(albumLink, "_blank"); // 打开 PDF 文件
        } else {
          alert("No album link available for this image.");
        }
      };
    }

    prevArrow.style.display = currentPosition === 1 ? "none" : "block";
    nextArrow.style.display = currentPosition === limitedImages.length ? "none" : "block";
  };

  const moveToNext = () => {
    if (currentPosition < limitedImages.length) {
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

  prevArrow.removeEventListener("click", moveToPrev);
  nextArrow.removeEventListener("click", moveToNext);
  limitedImages.forEach((img) => img.removeEventListener("click", moveToClickedImage));

  prevArrow.addEventListener("click", moveToPrev);
  nextArrow.addEventListener("click", moveToNext);
  limitedImages.forEach((img, index) => {
    img.addEventListener("click", () => moveToClickedImage(index));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveToPrev();
    if (e.key === "ArrowRight") moveToNext();
  });
};

document.addEventListener("DOMContentLoaded", initializeCoverflow);