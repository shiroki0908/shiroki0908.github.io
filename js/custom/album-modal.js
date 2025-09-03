const initAlbumModal = () => {
  const modal = document.getElementById("album_modal");
  
  // 如果模态框不存在，直接返回
  if (!modal) {
    console.log('Album modal not found, skipping initialization');
    return;
  }
  
  const mainImage = modal.querySelector(".modal_main_image");
  const thumbnails = modal.querySelector(".modal_thumbnails");

  // 禁止右击和拖拽（增强版）
  const disableImageInteractions = (imageElement) => {
    // 禁用右键菜单
    imageElement.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    });

    // 禁用拖拽
    imageElement.addEventListener("dragstart", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    // 禁用选择
    imageElement.addEventListener("selectstart", (event) => {
      event.preventDefault();
    });

    // 添加样式防护
    imageElement.style.userSelect = "none";
    imageElement.style.webkitUserSelect = "none";
    imageElement.style.mozUserSelect = "none";
    imageElement.style.msUserSelect = "none";
    
    imageElement.style.webkitUserDrag = "none";
    imageElement.style.userDrag = "none";
    imageElement.draggable = false;
    
    imageElement.style.webkitTouchCallout = "none";
    
    // 添加防护类
    imageElement.classList.add("album-no-context-menu");
  };

  // 显示模态框并加载图片
  const showModal = (images) => {
    modal.classList.remove("hidden");
    thumbnails.innerHTML = ""; // 清空缩略图容器

    // 默认显示第一张图片
    mainImage.src = images[0]?.url || "";
    disableImageInteractions(mainImage);

    // 渲染缩略图
    images.forEach((img, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = img.url;
      thumbnail.className = "thumbnail";
      if (index === 0) thumbnail.classList.add("active");

      // 禁止缩略图右击和拖拽
      disableImageInteractions(thumbnail);

      // 点击缩略图切换主图片 - 使用capture模式确保优先执行
      thumbnail.addEventListener("click", (event) => {
        console.log('Thumbnail clicked:', img.url); // 调试日志
        mainImage.src = img.url;
        document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"));
        thumbnail.classList.add("active");

        // 阻止事件冒泡，避免触发模态框关闭
        event.stopPropagation();
      }, { capture: true, passive: false });

      thumbnails.appendChild(thumbnail);
    });
  };

  // 关闭模态框
  const hideModal = () => {
    modal.classList.add("hidden");
  };

  // 事件委托：绑定相册卡片点击事件
  const albumContainer = document.querySelector(".album_container");
  if (albumContainer) {
    albumContainer.addEventListener("click", (event) => {
      const card = event.target.closest(".album_card");
      if (card) {
        const access = card.dataset.access;
        const images = JSON.parse(card.dataset.images || "[]");

        // 检查 access 是否为 private
        if (access === "private") {
          const userPassword = prompt("请输入密码以解锁相册：");
          if (userPassword === card.dataset.password) {
            alert("解锁成功！");
            showModal(images); // 解锁成功后显示模态框
          } else {
            alert("密码错误！");
          }
        } else {
          // 如果是公共相册直接打开
          if (images.length > 0) showModal(images);
        }
      }
    });
  }

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