/**
 * 作曲家与乐谱集展示区域JavaScript功能
 * 处理作曲家卡片的点击事件和模态框显示
 */

(function() {
    'use strict';
    
    // 作曲家数据（从Hexo数据中获取）
    let composersData = window.hexoComposerData || {};
    
    // 模态框相关元素
    let modal, modalContent, modalBackdrop, closeModal;
    let detailComposerImg, detailComposerName, detailComposerYears;
    let detailComposerBio, detailComposerTags, detailScoresContainer;
    
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
        
        console.log('作曲家展示区域初始化完成，绑定了', composerCards.length, '个作曲家卡片');
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
        console.log('尝试显示作曲家详情，ID:', composerId);
        console.log('作曲家数据:', composersData);
        console.log('模态框元素:', modal);
        
        const composer = composersData[composerId];
        console.log('找到的作曲家数据:', composer);
        
        if (!composer) {
            console.error('未找到作曲家数据，ID:', composerId);
            return;
        }
        
        if (!modal) {
            console.error('模态框元素未找到');
            return;
        }
        
        // 填充详情内容
        if (detailComposerImg) {
            detailComposerImg.src = composer.image;
            detailComposerImg.alt = composer.name + "的肖像";
            console.log('设置作曲家图片:', composer.image);
        }
        
        if (detailComposerName) {
            detailComposerName.textContent = composer.name;
            // 动态调整字体大小以适应容器宽度
            adjustFontSize(detailComposerName);
            console.log('设置作曲家姓名:', composer.name);
        }
        
        if (detailComposerYears) {
            detailComposerYears.textContent = composer.years;
            console.log('设置作曲家年份:', composer.years);
        }
        
        if (detailComposerBio) {
            detailComposerBio.textContent = composer.bio;
            console.log('设置作曲家简介:', composer.bio.substring(0, 50) + '...');
        }
        
        // 生成标签
        if (detailComposerTags) {
            detailComposerTags.innerHTML = '';
            composer.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag;
                detailComposerTags.appendChild(tagElement);
            });
            console.log('设置作曲家标签:', composer.tags);
        }
        
        // 生成乐谱集内容
        if (detailScoresContainer) {
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
                                <a href="${score.downloadUrl}" target="_blank" title="预览PDF">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </div>
                            <div class="score-download">
                                <a href="${score.downloadUrl}" download title="下载PDF">
                                    <i class="fas fa-download"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                
                detailScoresContainer.appendChild(scoreItem);
            });
            console.log('设置作曲家乐谱，数量:', composer.scores.length);
        }
        
        // 显示模态框
        console.log('准备显示模态框');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('模态框已显示，类名:', modal.className);
    }
    
    // 隐藏模态框
    function hideModal() {
        if (modal) {
            modal.classList.remove('show');
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
