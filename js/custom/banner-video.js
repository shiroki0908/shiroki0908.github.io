document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("banner-video");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!video) return;

  if (!isMobile) {
    // 桌面端允许自动播放
    video.setAttribute("autoplay", true);
    video.play().catch((err) => {
      console.warn("Autoplay failed:", err);
    });
  } else {
    // 移动端：关闭自动播放，或者换成图片
    video.removeAttribute("autoplay");
    video.pause();
    console.log("Mobile device detected, skip autoplay.");
  }
});