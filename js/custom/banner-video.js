// Banner视频播放控制和防护
// Banner Video Control and Protection

(function() {
    'use strict';
    
    // 防护功能
    function initBannerProtection() {
        // 禁用右键菜单
        function disableContextMenu(element) {
            if (element) {
                element.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            }
        }
        
        // 禁用拖拽
        function disableDrag(element) {
            if (element) {
                element.addEventListener('dragstart', function(e) {
                    e.preventDefault();
                    return false;
                });
                
                element.addEventListener('drag', function(e) {
                    e.preventDefault();
                    return false;
                });
            }
        }
        
        // 禁用选择
        function disableSelection(element) {
            if (element) {
                element.addEventListener('selectstart', function(e) {
                    e.preventDefault();
                    return false;
                });
                
                element.addEventListener('mousedown', function(e) {
                    if (e.detail > 1) { // 防止多次点击选择
                        e.preventDefault();
                    }
                });
            }
        }
        
        // 禁用键盘快捷键
        function disableKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                // 禁用F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P
                if (e.keyCode === 123 || // F12
                    (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
                    (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 65 || e.keyCode === 80))) { // Ctrl+U/S/A/P
                    
                    const target = e.target;
                    const isInBanner = target.closest('.author-content') || 
                                     target.closest('.todayCard-cover') || 
                                     target.id === 'banner-video' ||
                                     target.classList.contains('todayCard-video');
                    
                    if (isInBanner) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
            });
        }
        
        // 应用防护到所有banner元素
        function applyProtectionToElements() {
            // 保护banner视频
            const bannerVideos = document.querySelectorAll('#banner-video, .todayCard-video, video[id*="banner"], video[class*="banner"]');
            bannerVideos.forEach(video => {
                disableContextMenu(video);
                disableDrag(video);
                disableSelection(video);
                
                // 禁用视频控制栏
                video.controls = false;
                video.controlsList = 'nodownload nofullscreen noremoteplayback';
                video.disablePictureInPicture = true;
                
                // 防止暂停时显示播放按钮
                video.addEventListener('pause', function() {
                    setTimeout(() => {
                        if (video.paused) {
                            video.play().catch(() => {});
                        }
                    }, 100);
                });
                
                // 添加透明遮罩层
                if (!video.parentElement.querySelector('.banner-protection-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'banner-protection-overlay';
                    video.parentElement.style.position = 'relative';
                    video.parentElement.appendChild(overlay);
                    
                    disableContextMenu(overlay);
                    disableSelection(overlay);
                }
            });
            
            // 保护banner图片
            const bannerImages = document.querySelectorAll('.image-container img, .author-content img, img[src*="banner"], img[class*="banner"]');
            bannerImages.forEach(img => {
                disableContextMenu(img);
                disableDrag(img);
                disableSelection(img);
                
                // 添加透明遮罩层
                if (!img.parentElement.querySelector('.banner-protection-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'banner-protection-overlay';
                    img.parentElement.style.position = 'relative';
                    img.parentElement.appendChild(overlay);
                    
                    disableContextMenu(overlay);
                    disableSelection(overlay);
                }
            });
            
            // 保护整个banner容器
            const bannerContainers = document.querySelectorAll('.author-content, .todayCard-cover');
            bannerContainers.forEach(container => {
                disableContextMenu(container);
                disableSelection(container);
                container.classList.add('no-context-menu');
            });
        }
        
        // 初始化防护
        applyProtectionToElements();
        disableKeyboardShortcuts();
        
        // 监听DOM变化，动态应用防护
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // 元素节点
                            const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                            
                            [...videos, ...images].forEach(element => {
                                disableContextMenu(element);
                                disableDrag(element);
                                disableSelection(element);
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 获取banner视频元素
    const bannerVideo = document.getElementById('banner-video');
    
    // 视频播放控制
    function initBannerVideo() {
        if (bannerVideo) {
            // 确保视频自动播放
            bannerVideo.play().catch(function(error) {
                console.log('Video autoplay failed:', error);
            });
            
            // 监听视频加载完成
            bannerVideo.addEventListener('loadeddata', function() {
                console.log('Banner video loaded successfully');
            });
            
            // 监听视频错误
            bannerVideo.addEventListener('error', function(error) {
                console.error('Banner video error:', error);
            });
        }
    }
    
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initBannerProtection();
            initBannerVideo();
        });
    } else {
        initBannerProtection();
        initBannerVideo();
    }
    
    // 确保在页面完全加载后再次应用防护
    window.addEventListener('load', function() {
        setTimeout(initBannerProtection, 500);
    });
    
})(); 