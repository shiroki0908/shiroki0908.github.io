console.log("JavaScript is running!");

// 初始化照片墙
const initializePhotoWall = () => {
  console.log("Starting to initialize photo wall...");
  const wrap = document.getElementById("photo_wall_section");
  const container = wrap?.querySelector(".photo_container");

  if (!wrap) {
    console.warn("#photo_wall_section not found!");
    return;
  }

  if (!container) {
    console.warn(".photo_container not found inside #photo_wall_section!");
    return;
  }

  container.innerHTML = ""; // 清空容器内容

  // 动态加载照片墙数据
  const photoWallData = [
    { imgUrl: "https://i.imgur.com/6XYUqLB.png", name: "可爱黑猫1" },
    { imgUrl: "https://i.imgur.com/e11gTUR.png", name: "可爱黑猫2" },
    { imgUrl: "https://i.imgur.com/P6NLpMD.jpeg", name: "清晨阳光" },
    { imgUrl: "https://i.imgur.com/6pq7dg2.png", name: "午日阳光" },
    { imgUrl: "https://i.imgur.com/aX0Isw8.png", name: "白月光" },
  ];

  if (!Array.isArray(photoWallData) || photoWallData.length === 0) {
    console.warn("Photo wall data is empty or invalid.");
    return;
  }

  // 获取随机位置
  const getRandomPosition = () => {
    const containerWidth = wrap.offsetWidth;
    const containerHeight = wrap.offsetHeight;
    const x = Math.random() * (containerWidth - 200);
    const y = Math.random() * (containerHeight - 200);
    return { x, y };
  };

  // 居中逻辑
  const centerPhoto = (photoDiv) => {
    const centerX = wrap.offsetWidth / 2;
    const centerY = wrap.offsetHeight / 2;

    photoDiv.style.left = `${centerX}px`;
    photoDiv.style.top = `${centerY}px`;
    photoDiv.style.transform = "translate(-50%, -50%) scale(1.2) rotate(0deg)";
    photoDiv.style.zIndex = 100;

    // 随机分布其他图片
    container.querySelectorAll(".photo").forEach((other) => {
      if (other !== photoDiv) {
        const newPosition = getRandomPosition();
        other.style.left = `${newPosition.x}px`;
        other.style.top = `${newPosition.y}px`;
        other.style.transform = `rotate(${Math.random() * 30 - 15}deg) scale(1)`;
        other.style.zIndex = 1;
      }
    });
  };

  // 渲染图片
  photoWallData.forEach((photo, index) => {
    const photoDiv = document.createElement("div");
    photoDiv.className = "photo";
    photoDiv.id = `photo_${index}`;

    const imgElement = document.createElement("img");
    imgElement.src = photo.imgUrl;
    imgElement.alt = photo.name || "图片";
    imgElement.className = "photo_img";

    imgElement.onload = () => {
      const position = getRandomPosition();
      photoDiv.style.left = `${position.x}px`;
      photoDiv.style.top = `${position.y}px`;
      photoDiv.style.position = "absolute";
      photoDiv.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
    };

    imgElement.onerror = () => {
      console.error(`Failed to load image: ${photo.imgUrl}`);
    };

    // 点击事件：居中显示
    photoDiv.addEventListener("click", () => centerPhoto(photoDiv));

    photoDiv.appendChild(imgElement);
    container.appendChild(photoDiv);
  });

  console.log("Photo wall initialized successfully.");
};

// 监听页面跳转（通过 PJAX）
document.addEventListener("pjax:success", () => {
  console.log("PJAX navigation detected. Reinitializing photo wall...");
  initializePhotoWall();
});

// DOM 加载完成时初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing photo wall...");
  initializePhotoWall();
}); 