/**
 * 作曲家与乐谱集展示区域JavaScript功能
 * 处理作曲家卡片的点击事件和模态框显示
 * 新增：图片预加载和加载优化功能
 */

(function() {
    'use strict';
    
    // 作曲家数据（从Hexo数据中获取）
    let composersData = window.hexoComposerData || {};
    
    // 模态框相关元素
    let modal, modalContent, modalBackdrop, closeModal;
    let detailComposerImg, detailComposerName, detailComposerYears;
    let detailComposerBio, detailComposerTags, detailScoresContainer;
    
    // 图片预加载缓存
    let imageCache = new Map();
    
    // 初始化函数
    function init() {
        console.log('作曲家展示区域初始化开始，当前路径:', window.location.pathname);
        
        // 检查是否在乐谱坊页面
        if (window.location.pathname !== '/musicsheets/' && window.location.pathname !== '/musicsheets') {
            console.log('不在乐谱坊页面，跳过初始化');
            return;
        }
        
        // 获取模态框元素
        modal = document.getElementById('composer-modal');
        modalContent = document.getElementById('modal-content');
        modalBackdrop = document.getElementById('modal-backdrop');
        closeModal = document.getElementById('close-modal');
        
        // 获取详情页元素
        detailComposerImg = document.getElementById('detail-composer-img');
        detailComposerName = document.getElementById('detail-composer-name');
        detailComposerYears = document.getElementById('detail-composer-years');
        detailComposerBio = document.getElementById('detail-composer-bio');
        detailComposerTags = document.getElementById('detail-composer-tags');
        detailScoresContainer = document.getElementById('detail-scores-container');
        
        // 检查必要的DOM元素是否存在
        const composerCards = document.querySelectorAll('.composer-card');
        console.log('找到作曲家卡片数量:', composerCards.length);
        console.log('模态框元素:', modal);
        
        if (composerCards.length === 0) {
            console.log('作曲家卡片未找到，跳过初始化');
            return;
        }
        
        if (!modal) {
            console.log('模态框元素未找到，跳过初始化');
            return;
        }
        
        // 绑定事件
        bindEvents();
        
        // 获取作曲家数据
        loadComposersData();
        
        // 预加载所有作曲家图片
        preloadAllComposerImages();
        
        console.log('作曲家展示区域初始化完成，绑定了', composerCards.length, '个作曲家卡片');
    }
    
    // 预加载所有作曲家图片
    function preloadAllComposerImages() {
        if (!composersData || Object.keys(composersData).length === 0) {
            console.log('作曲家数据为空，跳过图片预加载');
            return;
        }
        
        console.log('开始预加载所有作曲家图片...');
        
        Object.values(composersData).forEach(composer => {
            if (composer.image) {
                preloadImage(composer.image, composer.id);
            }
        });
    }
    
    // 预加载单张图片
    function preloadImage(imageUrl, composerId) {
        if (imageCache.has(imageUrl)) {
            console.log(`图片已缓存: ${composerId}`);
            return Promise.resolve(imageCache.get(imageUrl));
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log(`图片预加载成功: ${composerId}`);
                imageCache.set(imageUrl, img);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`图片预加载失败: ${composerId}, URL: ${imageUrl}`);
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };
            
            // 设置图片属性
            img.src = imageUrl;
            img.loading = 'lazy';
            img.decoding = 'async';
            
            // 设置超时
            setTimeout(() => {
                if (!img.complete) {
                    console.warn(`图片加载超时: ${composerId}`);
                    reject(new Error(`Image load timeout: ${imageUrl}`));
                }
            }, 10000); // 10秒超时
        });
    }
    
    // 加载作曲家数据
    function loadComposersData() {
        // 重新获取作曲家数据
        composersData = window.hexoComposerData || {};
        console.log('加载作曲家数据:', composersData);
    }
    
    // 获取作曲家数据（从Hexo数据中获取）
    function getComposerDataById(composerId) {
        return composersData[composerId] || null;
    }
    
    // 绑定事件
    function bindEvents() {
        // 绑定作曲家卡片点击事件
        document.addEventListener('click', function(e) {
            const composerCard = e.target.closest('.composer-card');
            if (composerCard) {
                const composerId = composerCard.getAttribute('data-composer');
                if (composerId) {
                    console.log('点击了作曲家卡片，ID:', composerId);
                    showComposerDetail(composerId);
                }
            }
        });
        
        // 绑定关闭模态框事件
        if (closeModal) {
            closeModal.addEventListener('click', hideModal);
        }
        
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', hideModal);
        }
        
        // 按ESC键关闭模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
                hideModal();
            }
        });
    }
    
    // 动态调整字体大小以适应容器宽度
    function adjustFontSize(element) {
        if (!element) return;
        
        const container = element.parentElement;
        if (!container) return;
        
        const containerWidth = container.offsetWidth;
        const text = element.textContent;
        
        // 重置字体大小
        element.style.fontSize = '2.5rem';
        
        // 检查文字是否超出容器宽度
        let fontSize = 2.5; // 初始字体大小（rem）
        const minFontSize = 1.2; // 最小字体大小（rem）
        
        while (element.scrollWidth > containerWidth && fontSize > minFontSize) {
            fontSize -= 0.1;
            element.style.fontSize = fontSize + 'rem';
        }
    }

    // 显示作曲家详情
    function showComposerDetail(composerId) {
        const composer = getComposerDataById(composerId);
        if (!composer) {
            console.error('未找到作曲家数据:', composerId);
            return;
        }
        
        console.log('显示作曲家详情:', composer);
        
        // 填充基本信息
        if (detailComposerName) detailComposerName.textContent = composer.name;
        if (detailComposerYears) detailComposerYears.textContent = composer.years;
        if (detailComposerBio) detailComposerBio.textContent = composer.bio;
        
        // 生成标签
        if (detailComposerTags && composer.tags) {
            detailComposerTags.innerHTML = '';
            composer.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                detailComposerTags.appendChild(tagElement);
            });
        }
        
        // 优化图片加载
        if (detailComposerImg && composer.image) {
            // 设置加载状态
            detailComposerImg.setAttribute('loading', 'true');
            detailComposerImg.style.opacity = '0.7';
            detailComposerImg.style.filter = 'blur(1px)';
            
            // 检查缓存
            if (imageCache.has(composer.image)) {
                console.log('使用缓存的图片:', composerId);
                const cachedImg = imageCache.get(composer.image);
                detailComposerImg.src = cachedImg.src;
                detailComposerImg.alt = composer.name + "的肖像";
                detailComposerImg.setAttribute('data-loaded', 'true');
                detailComposerImg.removeAttribute('loading');
                detailComposerImg.style.opacity = '1';
                detailComposerImg.style.filter = 'none';
            } else {
                console.log('加载新图片:', composerId);
                // 预加载图片
                preloadImage(composer.image, composerId)
                    .then(() => {
                        detailComposerImg.src = composer.image;
                        detailComposerImg.alt = composer.name + "的肖像";
                        detailComposerImg.setAttribute('data-loaded', 'true');
                        detailComposerImg.removeAttribute('loading');
                        detailComposerImg.style.opacity = '1';
                        detailComposerImg.style.filter = 'none';
                    })
                    .catch(error => {
                        console.error('图片加载失败:', error);
                        // 使用原始方式加载
                        detailComposerImg.src = composer.image;
                        detailComposerImg.alt = composer.name + "的肖像";
                        detailComposerImg.removeAttribute('loading');
                    });
            }
        }
        
        // 生成乐谱集内容
        if (detailScoresContainer && composer.scores) {
            detailScoresContainer.innerHTML = '';
            composer.scores.forEach((score, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                
                scoreItem.innerHTML = `
                    <div class="score-header">
                        <div class="score-info">
                            <h4>${score.title}</h4>
                            <div class="score-meta">
                                <div><span>乐曲种类：</span>${score.type}</div>
                                <div><span>乐器：</span>${score.instruments}</div>
                            </div>
                        </div>
                        <div class="score-actions">
                            <div class="score-preview">
                                <a href="${score.downloadUrl}" target="_blank" title="预览"><i class="fas fa-eye"></i></a>
                            </div>
                            <div class="score-download">
                                <a href="${score.downloadUrl}" download title="下载"><i class="fas fa-download"></i></a>
                            </div>
                        </div>
                    </div>
                `;
                
                detailScoresContainer.appendChild(scoreItem);
            });
        }
        
        // 显示模态框
        if (modal) {
            modal.classList.add('show');
            // 禁止背景滚动
            document.body.style.overflow = 'hidden';
        }
    }
    
    // 隐藏模态框
    function hideModal() {
        if (modal) {
            modal.classList.remove('show');
            // 恢复背景滚动
            document.body.style.overflow = '';
        }
    }
    
    // 强制刷新初始化函数
    function forceRefreshInit() {
        console.log('强制刷新作曲家展示区域初始化');
        init();
    }
    
    // 将初始化函数暴露到全局作用域，供PJAX脚本调用
    window.initComposersSection = init;
    window.forceRefreshComposersSection = forceRefreshInit;
    
    // 添加测试函数
    window.testComposerModal = function() {
        console.log('测试模态框功能');
        console.log('当前作曲家数据:', composersData);
        console.log('模态框元素:', modal);
        
        // 测试贝多芬数据
        const beethoven = composersData['beethoven'];
        if (beethoven) {
            console.log('找到贝多芬数据:', beethoven);
            showComposerDetail('beethoven');
        } else {
            console.error('未找到贝多芬数据');
        }
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }
    
    // PJAX支持 - 添加强制刷新
    document.addEventListener('pjax:complete', () => {
        console.log('PJAX完成事件触发，强制刷新作曲家展示区域');
        setTimeout(forceRefreshInit, 100);
    });
    
    document.addEventListener('pjax:success', () => {
        console.log('PJAX成功事件触发，强制刷新作曲家展示区域');
        setTimeout(forceRefreshInit, 100);
    });
    
    // 页面可见性变化时强制刷新
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.location.pathname.includes('/musicsheets')) {
            console.log('页面重新可见，强制刷新作曲家展示区域');
            setTimeout(forceRefreshInit, 200);
        }
    });
    
    // 窗口焦点变化时强制刷新
    window.addEventListener('focus', () => {
        if (window.location.pathname.includes('/musicsheets')) {
            console.log('窗口重新获得焦点，强制刷新作曲家展示区域');
            setTimeout(forceRefreshInit, 200);
        }
    });
    
    // 监听作曲家数据加载事件
    document.addEventListener('composerDataLoaded', (event) => {
        console.log('作曲家数据加载事件触发:', event.detail);
        composersData = event.detail.composers || {};
        
        // 如果在乐谱坊页面，立即初始化
        if (window.location.pathname.includes('/musicsheets')) {
            setTimeout(init, 50);
        }
    });
    
})();
