// 全局图片数据
const galleryData = [
  { src: "https://i.imgur.com/6XYUqLB.png", alt: "可爱黑猫1" },
  { src: "https://i.imgur.com/e11gTUR.png", alt: "可爱黑猫2" },
  { src: "https://i.imgur.com/P6NLpMD.jpeg", alt: "清晨阳光" },
  { src: "https://i.imgur.com/6pq7dg2.png", alt: "午日阳光" },
  { src: "https://i.imgur.com/aX0Isw8.png", alt: "白月光" },
];

const initializeGallery = () => {
  const wrap = document.getElementById("ffka_sc_wrap");
  if (!wrap) {
    console.error("Container #ffka_sc_wrap not found!");
    return;
  }

  // 防止重复初始化
  if (wrap.dataset.initialized === "true") return;
  wrap.dataset.initialized = "true";

  if (!Array.isArray(galleryData) || galleryData.length === 0) {
    console.error("Gallery data is empty or invalid!");
    return;
  }

  // 清空容器内容
  wrap.innerHTML = "";

  const getRandomPosition = () => {
    const containerWidth = wrap.offsetWidth;
    const containerHeight = wrap.offsetHeight;

    const x = Math.random() * (containerWidth - 400); // 图片宽度限制为 400px
    const y = Math.random() * (containerHeight - 400); // 图片高度限制为 400px
    return { x, y };
  };

  const getCenterPosition = (photoDiv) => {
    const containerWidth = wrap.offsetWidth;
    const containerHeight = wrap.offsetHeight;
  
    const photoWidth = photoDiv.offsetWidth || 400; // 获取图片宽度
    const photoHeight = photoDiv.offsetHeight || 400; // 获取图片高度
  
    const x = containerWidth / 2 - photoWidth / 2; // 中心 X 坐标
    const y = containerHeight / 2 - photoHeight / 2; // 中心 Y 坐标
    return { x, y };
  };

  galleryData.forEach((image, index) => {
    const photoDiv = document.createElement("div");
    photoDiv.className = "photo";
    photoDiv.id = `photo_${index}`;

    const imgElement = document.createElement("img");
    imgElement.src = image.src;
    imgElement.alt = image.alt || "";
    imgElement.className = "photo_img";

    photoDiv.appendChild(imgElement);

    // 随机分布位置
    const position = getRandomPosition();
    photoDiv.style.left = `${position.x}px`;
    photoDiv.style.top = `${position.y}px`;
    photoDiv.style.transform = `rotate(${Math.random() * 30 - 15}deg)`; // 初始旋转角度

    // 点击时居中显示
    photoDiv.addEventListener("click", () => {
      const centerPosition = getCenterPosition(photoDiv); // 调用新的居中逻辑
    
      // 提升被点击图片的 z-index
      photoDiv.style.zIndex = 100;
    
      // 居中
      photoDiv.style.left = `${centerPosition.x}px`;
      photoDiv.style.top = `${centerPosition.y}px`;
      photoDiv.style.transform = `rotate(0deg) scale(1.2)`; // 放大并居中
    
      // 让其他图片重新随机分布，并恢复默认 z-index
      wrap.querySelectorAll(".photo").forEach((otherDiv) => {
        if (otherDiv !== photoDiv) {
          const newPosition = getRandomPosition();
          otherDiv.style.left = `${newPosition.x}px`;
          otherDiv.style.top = `${newPosition.y}px`;
          otherDiv.style.transform = `rotate(${Math.random() * 30 - 15}deg) scale(1)`; // 随机旋转
          otherDiv.style.zIndex = 1; // 恢复默认层级
        }
      });
    });

    wrap.appendChild(photoDiv);
  });

  wrap.style.opacity = 1; // 显示容器
};

const safelyInitializeGallery = () => {
  const wrap = document.getElementById("ffka_sc_wrap");

  // 检查目标节点是否存在且尚未初始化
  if (wrap && wrap.dataset.initialized !== "true") {
    initializeGallery();
  }
};

// 优化后的页面切换观察器
const observePageChanges = () => {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  let initialized = false; // 确保只在目标元素首次出现时初始化
  const observer = new MutationObserver(() => {
    const wrap = document.getElementById("ffka_sc_wrap");
    if (wrap && wrap.dataset.initialized !== "true") {
      initializeGallery();
      initialized = true; // 防止重复初始化
    }
  });

  observer.observe(targetNode, config);

  // 初次加载时执行一次初始化
  safelyInitializeGallery();
};

// 启动监听器
document.addEventListener("DOMContentLoaded", observePageChanges);