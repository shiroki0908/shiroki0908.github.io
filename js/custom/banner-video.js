window.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('banner-video');
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.play().catch(err => {
      console.warn('Autoplay failed:', err);
    });
  }
});