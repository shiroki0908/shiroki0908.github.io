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
        
        // 绑定事件
        bindEvents();
        
        // 获取作曲家数据
        loadComposersData();
    }
    
    // 加载作曲家数据
    function loadComposersData() {
        // 作曲家数据现在从Hexo数据中获取，不需要预先处理
        console.log('作曲家数据已从Hexo加载:', composersData);
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
        const composer = composersData[composerId];
        if (!composer || !modal) return;
        
        // 填充详情内容
        if (detailComposerImg) {
            detailComposerImg.src = composer.image;
            detailComposerImg.alt = composer.name + "的肖像";
        }
        
        if (detailComposerName) {
            detailComposerName.textContent = composer.name;
            // 动态调整字体大小以适应容器宽度
            adjustFontSize(detailComposerName);
        }
        
        if (detailComposerYears) {
            detailComposerYears.textContent = composer.years;
        }
        
        if (detailComposerBio) {
            detailComposerBio.textContent = composer.bio;
        }
        
        // 生成标签
        if (detailComposerTags) {
            detailComposerTags.innerHTML = '';
            composer.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.textContent = tag;
                detailComposerTags.appendChild(tagElement);
            });
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
        }
        
        // 显示模态框
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // 隐藏模态框
    function hideModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // PJAX支持
    if (typeof window !== 'undefined' && window.pjax) {
        document.addEventListener('pjax:success', init);
    }
    
})();
