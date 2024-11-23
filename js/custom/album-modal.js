// 使用事件委托绑定相册卡片的点击事件
const initAlbumModal = () => {
    const modal = document.getElementById("album_modal");
    const mainImage = modal.querySelector(".modal_main_image");
    const thumbnails = modal.querySelector(".modal_thumbnails");
  
    // 显示模态框并加载图片
    const showModal = (images) => {
      modal.classList.remove("hidden");
      thumbnails.innerHTML = ""; // 清空缩略图容器
  
      // 默认显示第一张图片
      mainImage.src = images[0]?.url || "";
  
      // 渲染缩略图
      images.forEach((img, index) => {
        const thumbnail = document.createElement("img");
        thumbnail.src = img.url;
        thumbnail.className = "thumbnail";
        if (index === 0) thumbnail.classList.add("active");
  
        // 点击缩略图切换主图片
        thumbnail.addEventListener("click", (event) => {
          mainImage.src = img.url;
          document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"));
          thumbnail.classList.add("active");
  
          // 阻止事件冒泡，避免触发模态框关闭
          event.stopPropagation();
        });
  
        thumbnails.appendChild(thumbnail);
      });
    };
  
    // 关闭模态框
    const hideModal = () => {
      modal.classList.add("hidden");
    };
  
    // 事件委托：绑定相册卡片点击事件
    document.querySelector(".album_container").addEventListener("click", (event) => {
      const card = event.target.closest(".album_card");
      if (card) {
        const images = JSON.parse(card.dataset.images || "[]");
        if (images.length > 0) showModal(images);
      }
    });
  
    // 点击模态框背景关闭模态框
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        hideModal();
      }
    });
  };
  
  // 初始化或页面迁移后重新绑定事件
  document.addEventListener("DOMContentLoaded", initAlbumModal);
  document.addEventListener("pjax:success", initAlbumModal);