// 相册页面图片防护
// Album Page Image Protection

(function() {
    'use strict';
    
    // 防护配置
    const PROTECTION_CONFIG = {
        // 要保护的选择器
        selectors: {
            albumImages: '#album_section img, .album_container img, .album_card img, #photo_wall_section img, .photo_container img, .photo_wall img',
            modalImages: '#album_modal img, .modal_main_image, .modal_thumbnails img, .thumbnail',
            albumContainers: '#album_section, .album_container, .photo_wall_container, #album_modal, #photo_wall_section, .photo_container',
            allImages: 'img[class*="album"], img[src*="album"], img[data-src*="album"], img[class*="photo"]'
        },
        // 防护等级
        protectionLevel: 'high', // low, medium, high
        // 是否显示警告
        showWarnings: true,
        // 调试模式
        debug: true
    };
    
    // 日志工具
    const logger = {
        log: (message) => {
            if (PROTECTION_CONFIG.debug) {
                console.log(`[Album Protection] ${message}`);
            }
        },
        warn: (message) => {
            if (PROTECTION_CONFIG.showWarnings) {
                console.warn(`[Album Protection] ${message}`);
            }
        }
    };
    
    // 防护工具类
    class AlbumProtection {
        constructor() {
            this.protectedElements = new Set();
            this.overlays = new Set();
            this.lastWarningTime = 0; // 防止重复显示警告
            this.warningCooldown = 2000; // 2秒冷却时间
            this.init();
        }
        
        // 初始化防护
        init() {
            logger.log('Initializing album protection...');
            this.setupProtection();
            this.setupMutationObserver();
            this.setupKeyboardProtection();
            this.setupAdvancedProtection();
        }
        
        // 禁用右键菜单
        disableContextMenu(element) {
            if (!element || this.protectedElements.has(element)) return;
            
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                if (PROTECTION_CONFIG.showWarnings) {
                    this.showProtectionWarning();
                }
                return false;
            };
            
            element.addEventListener('contextmenu', handler, { capture: true, passive: false });
            element.addEventListener('auxclick', handler, { capture: true, passive: false });
            
            // 移动端长按
            let touchTimer;
            element.addEventListener('touchstart', (e) => {
                touchTimer = setTimeout(() => {
                    handler(e);
                }, 500);
            }, { passive: false });
            
            element.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
            });
            
            element.addEventListener('touchmove', () => {
                clearTimeout(touchTimer);
            });
        }
        
        // 禁用拖拽
        disableDrag(element) {
            if (!element || this.protectedElements.has(element)) return;
            
            const dragHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
            
            element.addEventListener('dragstart', dragHandler, { capture: true, passive: false });
            element.addEventListener('drag', dragHandler, { capture: true, passive: false });
            element.addEventListener('dragend', dragHandler, { capture: true, passive: false });
            
            // 设置draggable属性
            if (element.tagName === 'IMG') {
                element.draggable = false;
                element.setAttribute('draggable', 'false');
            }
        }
        
        // 禁用选择
        disableSelection(element) {
            if (!element || this.protectedElements.has(element)) return;
            
            const selectionHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
            
            element.addEventListener('selectstart', selectionHandler, { capture: true, passive: false });
            element.addEventListener('mousedown', (e) => {
                if (e.detail > 1) { // 多次点击
                    e.preventDefault();
                    // 不阻止冒泡，允许正常的点击事件继续传播
                    return false;
                }
            }, { capture: true, passive: false });
            
            // 防止双击选择
            element.addEventListener('dblclick', selectionHandler, { capture: true, passive: false });
        }
        
        // 添加CSS防护类
        addProtectionClasses(element) {
            if (!element) return;
            
            element.classList.add('album-no-context-menu');
            
            // 设置CSS属性
            const protectionStyles = {
                'user-select': 'none',
                '-webkit-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                'user-drag': 'none',
                '-webkit-user-drag': 'none',
                '-khtml-user-drag': 'none',
                '-moz-user-drag': 'none',
                '-o-user-drag': 'none',
                '-webkit-touch-callout': 'none',
                '-webkit-tap-highlight-color': 'transparent',
                'pointer-events': 'auto'
            };
            
            Object.assign(element.style, protectionStyles);
        }
        
        // 创建透明遮罩层
        createProtectionOverlay(element) {
            if (!element || element.querySelector('.album-protection-overlay')) return;
            
            const overlay = document.createElement('div');
            overlay.className = 'album-protection-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999;
                background: transparent;
                pointer-events: auto;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            `;
            
            // 确保父元素有定位
            const parentStyle = window.getComputedStyle(element.parentElement);
            if (parentStyle.position === 'static') {
                element.parentElement.style.position = 'relative';
            }
            
            element.parentElement.appendChild(overlay);
            this.overlays.add(overlay);
            
            // 对遮罩层也应用防护
            this.disableContextMenu(overlay);
            this.disableSelection(overlay);
            this.disableDrag(overlay);
            
            return overlay;
        }
        
        // 缩略图轻度防护（保持点击功能）
        applyThumbnailProtection(element) {
            if (!element || this.protectedElements.has(element)) return;
            
            // 只禁用右键菜单，不使用capture模式以避免干扰点击事件
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (PROTECTION_CONFIG.showWarnings) {
                    this.showProtectionWarning();
                }
            }, { passive: false });
            
            // 轻度拖拽防护，不使用capture模式
            element.addEventListener('dragstart', (e) => {
                e.preventDefault();
            }, { passive: false });
            
            // 设置基础CSS防护，但不影响事件
            element.style.userSelect = "none";
            element.style.webkitUserSelect = "none";
            element.style.webkitUserDrag = "none";
            element.style.userDrag = "none";
            element.draggable = false;
            
            // 确保可以点击
            element.style.pointerEvents = "auto";
            
            this.protectedElements.add(element);
            logger.log(`Thumbnail lightly protected: ${element.tagName}.${element.className}`);
        }
        
        // 应用完整防护
        applyFullProtection(element) {
            if (!element || this.protectedElements.has(element)) return;
            
            // 对缩略图进行特殊处理，保持点击功能
            if (element.classList.contains('thumbnail') || element.closest('.modal_thumbnails')) {
                this.applyThumbnailProtection(element);
                return;
            }
            
            this.disableContextMenu(element);
            this.disableDrag(element);
            this.disableSelection(element);
            this.addProtectionClasses(element);
            
            // 对图片元素创建遮罩层，但排除缩略图和模态框内的图片
            if (element.tagName === 'IMG' && 
                PROTECTION_CONFIG.protectionLevel === 'high' &&
                !element.classList.contains('thumbnail') &&
                !element.closest('.modal_thumbnails') &&
                !element.closest('#album_modal')) {
                this.createProtectionOverlay(element);
            }
            
            this.protectedElements.add(element);
            logger.log(`Protected element: ${element.tagName}.${element.className}`);
        }
        
        // 清理缩略图上的遮罩层
        cleanupThumbnailOverlays() {
            document.querySelectorAll('.modal_thumbnails .album-protection-overlay, .thumbnail + .album-protection-overlay').forEach(overlay => {
                logger.log('Removing overlay from thumbnail area');
                overlay.remove();
            });
        }
        
        // 设置基础防护
        setupProtection() {
            // 先清理可能存在的缩略图遮罩层
            this.cleanupThumbnailOverlays();
            
            // 保护所有相册图片
            document.querySelectorAll(PROTECTION_CONFIG.selectors.albumImages).forEach(img => {
                this.applyFullProtection(img);
            });
            
            // 保护模态框图片
            document.querySelectorAll(PROTECTION_CONFIG.selectors.modalImages).forEach(img => {
                this.applyFullProtection(img);
            });
            
            // 保护容器
            document.querySelectorAll(PROTECTION_CONFIG.selectors.albumContainers).forEach(container => {
                this.disableSelection(container);
                this.addProtectionClasses(container);
            });
            
            // 保护所有包含album关键词的图片
            document.querySelectorAll(PROTECTION_CONFIG.selectors.allImages).forEach(img => {
                this.applyFullProtection(img);
            });
        }
        
        // 设置变化监听器
        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // 监听新增的节点
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 延迟应用防护，确保其他脚本先完成初始化
                            setTimeout(() => {
                                // 检查是否是图片
                                if (node.tagName === 'IMG') {
                                    if (this.shouldProtectImage(node)) {
                                        this.applyFullProtection(node);
                                    }
                                }
                                
                                // 检查子元素中的图片
                                const images = node.querySelectorAll && node.querySelectorAll('img');
                                if (images) {
                                    images.forEach(img => {
                                        if (this.shouldProtectImage(img)) {
                                            this.applyFullProtection(img);
                                        }
                                    });
                                }
                            }, 100); // 延迟100ms应用防护
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            logger.log('Mutation observer setup complete');
        }
        
        // 判断是否应该保护图片
        shouldProtectImage(img) {
            const src = img.src || img.getAttribute('data-src') || '';
            const className = img.className || '';
            const parentClasses = img.parentElement ? img.parentElement.className : '';
            
            // 排除模态框中的缩略图，让它们保持点击功能
            if (img.classList.contains('thumbnail') || img.closest('.modal_thumbnails')) {
                logger.log('Skipping thumbnail protection to preserve click functionality');
                return false;
            }
            
            return (
                src.includes('album') ||
                src.includes('photo') ||
                className.includes('album') ||
                className.includes('photo') ||
                parentClasses.includes('album') ||
                parentClasses.includes('photo') ||
                img.closest('#album_section') ||
                img.closest('#album_modal') ||
                img.closest('.album_container') ||
                img.closest('.photo_wall') ||
                img.closest('#photo_wall_section') ||
                img.closest('.photo_container')
            );
        }
        
        // 键盘快捷键防护
        setupKeyboardProtection() {
            document.addEventListener('keydown', (e) => {
                // 在相册页面禁用特定快捷键
                if (this.isInAlbumContext()) {
                    // 禁用 Ctrl+S (保存)
                    if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        this.showProtectionWarning();
                        return false;
                    }
                    
                    // 禁用 Ctrl+A (全选)
                    if (e.ctrlKey && e.key === 'a') {
                        e.preventDefault();
                        return false;
                    }
                    
                    // 禁用 F12 和开发者工具快捷键
                    if (e.key === 'F12' || 
                        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                        (e.ctrlKey && e.key === 'U')) {
                        e.preventDefault();
                        this.showProtectionWarning();
                        return false;
                    }
                }
            }, { capture: true });
        }
        
        // 高级防护设置
        setupAdvancedProtection() {
            // 防止通过控制台访问图片
            if (PROTECTION_CONFIG.protectionLevel === 'high') {
                this.setupConsoleProtection();
            }
            
            // 防止通过开发者工具复制图片URL
            this.setupDevToolsProtection();
            
            // 防止截图（在支持的浏览器中）
            this.setupScreenshotProtection();
        }
        
        // 控制台防护
        setupConsoleProtection() {
            // 重写console方法以检测开发者工具
            const originalLog = console.log;
            console.log = function(...args) {
                if (this.isInAlbumContext && this.isInAlbumContext()) {
                    // 检测到在相册页面使用控制台
                    this.showProtectionWarning && this.showProtectionWarning();
                }
                return originalLog.apply(console, args);
            }.bind(this);
        }
        
        // 开发者工具防护
        setupDevToolsProtection() {
            // 检测开发者工具
            let devtools = {open: false, orientation: null};
            const threshold = 160;
            
            setInterval(() => {
                if (this.isInAlbumContext()) {
                    if (window.outerHeight - window.innerHeight > threshold || 
                        window.outerWidth - window.innerWidth > threshold) {
                        if (!devtools.open) {
                            devtools.open = true;
                            this.showProtectionWarning();
                        }
                    } else {
                        devtools.open = false;
                    }
                }
            }, 500);
        }
        
        // 截图防护
        setupScreenshotProtection() {
            // 在支持的浏览器中防止截图
            if ('getDisplayMedia' in navigator.mediaDevices) {
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden && this.isInAlbumContext()) {
                        // 页面被隐藏时可能在截图
                        logger.warn('Potential screenshot attempt detected');
                    }
                });
            }
        }
        
        // 检查是否在相册上下文中
        isInAlbumContext() {
            return document.querySelector('#album_section') !== null ||
                   document.querySelector('#album_modal:not(.hidden)') !== null ||
                   window.location.pathname.includes('/album');
        }
        
        // 显示防护警告
        showProtectionWarning() {
            const now = Date.now();
            
            // 检查页面是否还在加载中
            if (document.readyState === 'loading') {
                return;
            }
            
            // 检查是否有loading动画在显示
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer && !loadingContainer.classList.contains('hide')) {
                return;
            }
            
            // 额外检查其他可能的loading元素
            if (document.querySelector('.loading, #loading, [class*="loading"]:not(.album-protection-warning)')) {
                return;
            }
            
            // 检查冷却时间，防止重复显示
            if (now - this.lastWarningTime < this.warningCooldown) {
                return;
            }
            
            // 检查是否已有警告在显示
            if (document.querySelector('.album-protection-warning')) {
                return;
            }
            
            this.lastWarningTime = now;
            
            // 创建警告提示
            const warning = document.createElement('div');
            warning.className = 'album-protection-warning';
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                font-family: Arial, sans-serif;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
            `;
            warning.textContent = '图片受保护，禁止复制或下载';
            
            // 添加动画样式
            if (!document.querySelector('#album-protection-style')) {
                const style = document.createElement('style');
                style.id = 'album-protection-style';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(warning);
            
            // 3秒后移除警告
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.remove();
                }
            }, 3000);
        }
        
        // 刷新防护（用于动态内容）
        refresh() {
            logger.log('Refreshing album protection...');
            this.setupProtection();
        }
        
        // 清理防护
        cleanup() {
            this.protectedElements.clear();
            this.overlays.forEach(overlay => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            });
            this.overlays.clear();
        }
    }
    
    // 创建全局实例
    let albumProtection = null;
    
    // 初始化函数
    function initAlbumProtection() {
        // 等待loading动画完成
        const waitForLoadingComplete = () => {
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer && !loadingContainer.classList.contains('hide')) {
                // 如果loading还在显示，延迟100ms再检查
                setTimeout(waitForLoadingComplete, 100);
                return;
            }
            
            // loading已完成，开始初始化防护
            if (albumProtection) {
                albumProtection.cleanup();
            }
            albumProtection = new AlbumProtection();
            
            // 将实例添加到全局作用域以便调试
            if (PROTECTION_CONFIG.debug) {
                window.albumProtection = albumProtection;
            }
        };
        
        waitForLoadingComplete();
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initAlbumProtection, 200); // 稍微延迟确保DOM完全准备好
        });
    } else {
        setTimeout(initAlbumProtection, 200);
    }
    
    // PJAX支持
    document.addEventListener('pjax:success', () => {
        setTimeout(initAlbumProtection, 100);
    });
    
    // Turbo支持
    document.addEventListener('turbo:load', () => {
        setTimeout(initAlbumProtection, 100);
    });
    
    // 页面可见性变化时刷新防护
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && albumProtection) {
            setTimeout(() => albumProtection.refresh(), 100);
        }
    });
    
    logger.log('Album protection script loaded');
    
})();