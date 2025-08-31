/**
 * 弹幕页面JavaScript
 * 处理弹幕页面的弹幕显示功能
 */

(function() {
    'use strict';
    
    // 等待页面加载完成
    document.addEventListener('DOMContentLoaded', function() {
        console.log('弹幕页面JavaScript已加载');
        initMessagePage();
    });
    
    // 立即执行一次，防止DOMContentLoaded已经触发
    if (document.readyState === 'loading') {
        console.log('页面还在加载中，等待DOMContentLoaded');
    } else {
        console.log('页面已加载完成，立即初始化');
        initMessagePage();
    }
    
    function initMessagePage() {
        // 检查是否在弹幕页面
        if (!document.getElementById('barrage')) {
            return;
        }
        
        console.log('初始化弹幕页面');
        
        // 获取弹幕配置
        const envelopeConfig = window.GLOBAL_CONFIG?.envelope || {
            line: 10,
            speed: 20,
            hover: true,
            loop: true
        };
        
        // 初始化弹幕按钮事件
        initBarrageButtons();
        
        // 等待评论系统加载完成后初始化弹幕
        waitForCommentsAndInitBarrage();
    }
    
    function initBarrageButtons() {
        const openBtn = document.querySelector('.switch_message .open');
        const closeBtn = document.querySelector('.switch_message .close');
        
        if (openBtn) {
            openBtn.addEventListener('click', function() {
                console.log('点击显示弹幕按钮');
                showBarrage();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log('点击隐藏弹幕按钮');
                hideBarrage();
            });
        }
    }
    
    function showBarrage() {
        console.log('showBarrage函数被调用');
        const barrageElement = document.getElementById('barrage');
        console.log('弹幕容器元素:', barrageElement);
        
        if (barrageElement) {
            barrageElement.classList.remove('hide');
            console.log('显示弹幕容器');
            
            // 如果弹幕还没有初始化，尝试初始化
            if (!window.currentBarrage) {
                console.log('尝试初始化弹幕');
                waitForCommentsAndInitBarrage();
            } else {
                console.log('弹幕已存在，直接显示');
            }
        } else {
            console.error('弹幕容器不存在');
        }
    }
    
    function hideBarrage() {
        console.log('hideBarrage函数被调用');
        const barrageElement = document.getElementById('barrage');
        if (barrageElement) {
            barrageElement.classList.add('hide');
            console.log('隐藏弹幕容器');
        } else {
            console.error('弹幕容器不存在');
        }
    }
    
    function waitForCommentsAndInitBarrage() {
        // 等待评论系统加载
        let attempts = 0;
        const maxAttempts = 50; // 最多等待5秒
        
        const checkComments = () => {
            attempts++;
            
            // 检查是否有评论数据
            if (window.GLOBAL_CONFIG?.comment?.use) {
                const commentSystem = window.GLOBAL_CONFIG.comment.use[0];
                console.log('检测到评论系统:', commentSystem);
                
                // 根据不同的评论系统获取评论数据
                switch (commentSystem) {
                    case 'Waline':
                        initWalineBarrage();
                        break;
                    case 'Twikoo':
                        initTwikooBarrage();
                        break;
                    case 'Valine':
                        initValineBarrage();
                        break;
                    case 'Artalk':
                        initArtalkBarrage();
                        break;
                    default:
                        console.log('不支持的评论系统:', commentSystem);
                        createMockBarrage();
                }
                return;
            }
            
            if (attempts < maxAttempts) {
                setTimeout(checkComments, 100);
            } else {
                console.log('评论系统加载超时，使用模拟弹幕');
                createMockBarrage();
            }
        };
        
        checkComments();
    }
    
    function initWalineBarrage() {
        // 等待Waline加载完成
        const checkWaline = () => {
            if (window.Waline && window.Waline.instance) {
                console.log('Waline已加载，获取评论数据');
                // Waline的评论数据获取方式
                // 这里需要根据实际的Waline API来获取评论
                createMockBarrage(); // 暂时使用模拟数据
            } else {
                setTimeout(checkWaline, 100);
            }
        };
        checkWaline();
    }
    
    function initTwikooBarrage() {
        // 等待Twikoo加载完成
        const checkTwikoo = () => {
            if (window.twikoo) {
                console.log('Twikoo已加载，获取评论数据');
                // Twikoo的评论数据获取方式
                twikoo.getCommentsList({
                    page: window.location.pathname,
                    includeReply: true
                }).then(result => {
                    if (result && result.length > 0) {
                        console.log('获取到Twikoo评论数据:', result.length, '条');
                        initializeCommentBarrage(result);
                    } else {
                        createMockBarrage();
                    }
                }).catch(error => {
                    console.error('获取Twikoo评论失败:', error);
                    createMockBarrage();
                });
            } else {
                setTimeout(checkTwikoo, 100);
            }
        };
        checkTwikoo();
    }
    
    function initValineBarrage() {
        // Valine的评论数据获取方式
        console.log('初始化Valine弹幕');
        createMockBarrage(); // 暂时使用模拟数据
    }
    
    function initArtalkBarrage() {
        // Artalk的评论数据获取方式
        console.log('初始化Artalk弹幕');
        createMockBarrage(); // 暂时使用模拟数据
    }
    
    function createMockBarrage() {
        console.log('创建模拟弹幕数据');
        
        // 创建模拟评论数据
        const mockComments = [
            {
                nick: '访客1',
                content: '这个博客很不错！',
                mailMd5: 'default',
                id: 'comment-1'
            },
            {
                nick: '访客2',
                content: '学到了很多知识，感谢分享！',
                mailMd5: 'default',
                id: 'comment-2'
            },
            {
                nick: '访客3',
                content: '弹幕功能很有趣！',
                mailMd5: 'default',
                id: 'comment-3'
            },
            {
                nick: '访客4',
                content: '期待更多精彩内容！',
                mailMd5: 'default',
                id: 'comment-4'
            },
            {
                nick: '访客5',
                content: '主题设计很棒！',
                mailMd5: 'default',
                id: 'comment-5'
            }
        ];
        
        // 初始化弹幕
        if (typeof initializeCommentBarrage === 'function') {
            console.log('调用initializeCommentBarrage函数');
            initializeCommentBarrage(mockComments);
        } else {
            console.error('initializeCommentBarrage函数不存在，检查barrage.min.js是否已加载');
            // 尝试手动创建弹幕
            createManualBarrage(mockComments);
        }
    }
    
    function createManualBarrage(comments) {
        console.log('手动创建弹幕');
        const barrageElement = document.getElementById('barrage');
        if (!barrageElement) {
            console.error('弹幕容器不存在');
            return;
        }
        
        // 清空现有内容
        barrageElement.innerHTML = '';
        
        // 创建弹幕项
        comments.forEach((comment, index) => {
            const barrageItem = document.createElement('div');
            barrageItem.className = 'default-style';
            barrageItem.style.cssText = `
                position: absolute;
                top: ${Math.random() * 80 + 10}%;
                left: 100%;
                animation: moveLeft ${Math.random() * 10 + 10}s linear infinite;
                z-index: 1000;
            `;
            
            barrageItem.innerHTML = `
                <a href="javascript:void(0)">
                    <img src="https://cravatar.cn/avatar/default?s=30" alt="${comment.nick}">
                    <p>${comment.nick}: ${comment.content}</p>
                </a>
            `;
            
            barrageElement.appendChild(barrageItem);
        });
        
        // 添加CSS动画
        if (!document.getElementById('barrage-animation-style')) {
            const style = document.createElement('style');
            style.id = 'barrage-animation-style';
            style.textContent = `
                @keyframes moveLeft {
                    from { left: 100%; }
                    to { left: -300px; }
                }
            `;
            document.head.appendChild(style);
        }
        
        console.log('手动弹幕创建完成');
    }
    
    // 暴露函数供外部调用
    window.messagePageControl = {
        showBarrage: showBarrage,
        hideBarrage: hideBarrage,
        initBarrage: initBarrageFromComments,
        createMockBarrage: createMockBarrage
    };
    
    // 直接暴露到全局作用域
    window.showBarrage = showBarrage;
    window.hideBarrage = hideBarrage;
    
})();
    