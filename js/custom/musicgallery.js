document.addEventListener("DOMContentLoaded", () => {
  const coverflowContainer = document.querySelector(".coverflow");
  const images = Array.from(coverflowContainer.querySelectorAll(".coverflow__image"));
  const prevArrow = coverflowContainer.querySelector(".prev-arrow");
  const nextArrow = coverflowContainer.querySelector(".next-arrow");

  let currentPosition = 3; // 初始位置：第 3 张图片居中

  // 更新 Coverflow 状态
  const updateCoverflow = () => {
    coverflowContainer.dataset.coverflowPosition = currentPosition;

    // 更新图片样式
    images.forEach((img, index) => {
      const offset = index + 1 - currentPosition; // 计算偏移量
      const translateX = offset * 150; // 设置水平位移
      const scale = Math.max(0.8, 1 - Math.abs(offset) * 0.2); // 根据偏移设置缩放
      const rotateY = offset * -25; // 设置旋转角度
      const opacity = Math.max(0.5, 1 - Math.abs(offset) * 0.3); // 根据偏移设置透明度
      const zIndex = 50 - Math.abs(offset) * 10; // 设置 zIndex

      img.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;
      img.style.opacity = opacity;
      img.style.zIndex = zIndex;
    });

    // 控制按钮显示状态
    prevArrow.style.display = currentPosition === 1 ? "none" : "block"; // 隐藏左箭头
    nextArrow.style.display = currentPosition === images.length ? "none" : "block"; // 隐藏右箭头
  };

  // 切换到下一个
  const moveToNext = () => {
    if (currentPosition < images.length) {
      currentPosition++;
      updateCoverflow();
    }
  };

  // 切换到上一个
  const moveToPrev = () => {
    if (currentPosition > 1) {
      currentPosition--;
      updateCoverflow();
    }
  };

  // 初始化
  updateCoverflow();

  // 添加事件监听
  prevArrow.addEventListener("click", moveToPrev);
  nextArrow.addEventListener("click", moveToNext);

  // 键盘导航
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveToPrev();
    if (e.key === "ArrowRight") moveToNext();
  });
});