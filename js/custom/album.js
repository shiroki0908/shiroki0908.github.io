const initializeAlbumSectionWithDelegation = () => {
  const albumSection = document.querySelector("#album_section");

  if (!albumSection) {
    console.error("#album_section not found!");
    return;
  }

  console.log("Initializing album section with event delegation...");

  // 默认分类逻辑
  const applyDefaultCategory = () => {
    const activeTag = albumSection.querySelector(".album_tags .tag.active");
    const defaultTag = activeTag || albumSection.querySelector(".album_tags .tag");
    const selectedTag = defaultTag?.dataset.tag;

    if (!selectedTag) {
      console.error("No default tag found!");
      return;
    }

    // 切换标签激活状态
    albumSection.querySelectorAll(".album_tags .tag").forEach((el) => el.classList.remove("active"));
    defaultTag.classList.add("active");

    // 显示与默认标签匹配的相册，隐藏其他相册
    albumSection.querySelectorAll(".album_card").forEach((card) => {
      if (card.dataset.tag === selectedTag) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  };

  // 禁止图片右键下载（增强版）
  const disableImageDownload = () => {
    albumSection.querySelectorAll("img").forEach((img) => {
      // 禁用右键菜单
      img.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      // 禁用拖拽下载
      img.addEventListener("dragstart", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });

      // 禁用选择
      img.addEventListener("selectstart", (event) => {
        event.preventDefault();
      });

      // 添加 CSS 防止复制
      img.style.userSelect = "none";
      img.style.webkitUserSelect = "none";
      img.style.mozUserSelect = "none";
      img.style.msUserSelect = "none";
      
      // 禁用拖拽
      img.style.webkitUserDrag = "none";
      img.style.userDrag = "none";
      img.draggable = false;
      
      // 添加防护类
      img.classList.add("album-no-context-menu");
    });
  };

  // 应用默认分类逻辑
  applyDefaultCategory();

  // 禁止图片右键下载
  disableImageDownload();

  // 绑定事件委托到父容器
  albumSection.addEventListener("click", (event) => {
    // 检查是否点击了标签
    const tagElement = event.target.closest(".album_tags .tag");
    if (tagElement) {
      const selectedTag = tagElement.dataset.tag;

      // 切换标签激活状态
      albumSection.querySelectorAll(".album_tags .tag").forEach((el) => el.classList.remove("active"));
      tagElement.classList.add("active");

      // 显示与选中标签匹配的相册，隐藏其他相册
      albumSection.querySelectorAll(".album_card").forEach((card) => {
        if (card.dataset.tag === selectedTag) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });

      console.log(`Tag clicked: ${selectedTag}`);

      // 更新后重新禁止图片下载
      disableImageDownload();
    }
  });
};

// 初始化页面逻辑
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing album section...");
  initializeAlbumSectionWithDelegation();
});

// 监听页面迁移（如 pjax:success）
document.addEventListener("pjax:success", () => {
  console.log("Page migrated. Reinitializing album section...");
  initializeAlbumSectionWithDelegation();
}); 