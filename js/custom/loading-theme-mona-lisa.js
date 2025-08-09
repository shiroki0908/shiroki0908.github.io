/**
 * Loading Theme Mona Lisa - Solitude Theme Loading Animation
 * Mona Lisa主题的loading动画实现
 * 
 * 功能：
 * - SVG描边动画
 * - 进度条模拟
 * - 双重收起动画
 * - Pjax兼容
 * - 超时保护
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        const DURATION = 1.5; // 动画时长（秒）
        let timer = null;
        let progress = 0;
        let isAnimating = false;

        // 进度条更新
        function updateProgress(percent) {
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
        }

        // 描边动画
        function animatePaths(appear) {
            const paths = Array.from(document.querySelectorAll('.draw-path'));
            
            if (paths.length === 0) {
                console.log('No draw-path elements found');
                return;
            }

            // 1. 先全部 transition 设为 none，设置起始状态
            paths.forEach(path => {
                const len = path.getTotalLength();
                path.style.strokeDasharray = len;
                path.style.transition = 'none';
                path.style.strokeDashoffset = appear ? len : 0;
            });

            // 2. 强制重绘
            document.body.offsetHeight;

            // 3. 统一设置 transition 和目标状态
            paths.forEach(path => {
                path.style.transition = `stroke-dashoffset ${DURATION}s linear`;
                path.style.strokeDashoffset = appear ? 0 : path.style.strokeDasharray;
            });

            // 4. 动画结束后切换状态
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (!isAnimating) {
                    animatePaths(!appear);
                }
            }, DURATION * 1000 + 50);
        }

        // 模拟加载过程
        function simulateLoading() {
            const loadingSteps = [
                { progress: 20, delay: 500 },
                { progress: 40, delay: 800 },
                { progress: 60, delay: 600 },
                { progress: 80, delay: 700 },
                { progress: 100, delay: 1000 }
            ];

            let currentStep = 0;

            function nextStep() {
                if (currentStep < loadingSteps.length) {
                    const step = loadingSteps[currentStep];
                    updateProgress(step.progress);
                    currentStep++;
                    
                    if (currentStep < loadingSteps.length) {
                        setTimeout(nextStep, step.delay);
                    } else {
                        // 加载完成，开始收起动画
                        setTimeout(() => {
                            completeLoading();
                        }, 500);
                    }
                }
            }

            nextStep();
        }

        // 完成加载 - 实现两次收起动画
        function completeLoading() {
            isAnimating = true;
            
            // 停止描边动画
            clearTimeout(timer);
            
            // 第一次收起：loading-animation 层先收起
            setTimeout(() => {
                const loadingAnimation = document.getElementById('loading-animation');
                if (loadingAnimation) {
                    loadingAnimation.style.transform = 'translateX(100%)';
                }
                
                // 第二次和第三次同时收起：loading-bg 和 loading-container 一起收起
                setTimeout(() => {
                    const loadingBg = document.getElementById('loading-bg');
                    const loadingContainer = document.getElementById('loading-container');
                    
                    if (loadingBg) {
                        loadingBg.style.transform = 'translateX(100%)';
                    }
                    if (loadingContainer) {
                        loadingContainer.style.transform = 'translateX(100%)';
                    }
                    
                    // 收起完成后移除 loading 容器
                    setTimeout(() => {
                        // 移除 loading 相关遮罩
                        const loadingBg = document.getElementById('loading-bg');
                        if (loadingBg) loadingBg.remove();
                        const loadingContainer = document.getElementById('loading-container');
                        if (loadingContainer) loadingContainer.remove();
                        // 兼容其它可能的遮罩
                        const masks = document.querySelectorAll('.mask, .overlay, .loading-mask, .loading-overlay');
                        masks.forEach(el => el.remove());
                        // 恢复页面滚动 - 移除所有滚动限制
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                        document.body.classList.remove('loading-active');
                        document.documentElement.classList.remove('loading-active');
                        // 清除loading标记
                        window.loadingInProgress = false;
                        // 触发pace-done事件
                        const body = document.getElementById('body');
                        if (body) {
                            body.className = 'pace-done';
                        }
                        // 确保页面回到顶部
                        window.scrollTo(0, 0);
                        // 延迟触发一次 percent 函数，确保初始值正确
                        setTimeout(() => {
                            if (typeof percent === 'function') percent();
                        }, 100);
                        // 延迟初始化TOC和其他组件，确保loading完全结束且DOM稳定
                        setTimeout(() => {
                            console.log('[Loading] Mona Lisa loading完成，开始重新初始化');
                            
                            // 检查页面基本元素
                            const tocContainer = document.getElementById('card-toc');
                            const articleContainer = document.querySelector('.article-container');
                            console.log('[Loading] TOC容器存在:', !!tocContainer);
                            console.log('[Loading] 文章容器存在:', !!articleContainer);
                            console.log('[Loading] PAGE_CONFIG.toc:', PAGE_CONFIG?.toc);
                            
                            // 先清理可能存在的旧事件监听器
                            if (window.tocScrollFn) {
                                console.log('[Loading] 清理旧的scroll监听器');
                                window.removeEventListener('scroll', window.tocScrollFn);
                                window.tocScrollFn = null;
                            }
                            
                            // 强制重新初始化TOC，不依赖refreshFn
                            if (PAGE_CONFIG?.toc && typeof toc !== 'undefined') {
                                console.log('[Loading] 直接重新初始化TOC');
                                try {
                                    toc.init();
                                    console.log('[Loading] TOC初始化成功');
                                } catch (error) {
                                    console.error('[Loading] TOC初始化失败:', error);
                                }
                            }
                            
                            // 强制触发scroll和resize事件
                            setTimeout(() => {
                                console.log('[Loading] 触发scroll和resize事件');
                                if (window.tocScrollFn) {
                                    window.tocScrollFn();
                                }
                                window.dispatchEvent(new Event('resize'));
                                window.dispatchEvent(new Event('scroll'));
                            }, 200);
                            
                        }, 800);
                    }, 200);
                }, 200);
            }, 400);
        }

        // 开始动画
        function startAnimation() {
            console.log('Starting Mona Lisa loading animation...');
            
            // 隐藏页面滚动条 - 多种方式确保隐藏
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.classList.add('loading-active');
            document.documentElement.classList.add('loading-active');
            
            // 标记loading正在运行，避免其他脚本冲突
            window.loadingInProgress = true;
            
            // 开始描边动画
            animatePaths(true);
            
            // 开始模拟加载
            setTimeout(() => {
                simulateLoading();
            }, 1000);
        }

        // 确保DOM元素存在后再开始动画
        function initWhenReady() {
            const loadingContainer = document.getElementById('loading-container');
            if (loadingContainer) {
                console.log('Mona Lisa loading container found, starting animation');
                startAnimation();
            } else {
                console.log('Loading container not found, waiting...');
                setTimeout(initWhenReady, 50);
            }
        }
        
        // 立即检查或等待DOM准备
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWhenReady);
        } else {
            initWhenReady();
        }

        // Pjax兼容
        window.addEventListener('pjax:send', () => {
            console.log('Pjax send event triggered');
            // 重新创建loading容器
            const existingContainer = document.getElementById('loading-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // 重新初始化loading
            isAnimating = false;
            progress = 0;
            clearTimeout(timer);
            
            // 重新开始动画
            setTimeout(() => {
                animatePaths(true);
                simulateLoading();
            }, 100);
        });

        // 超时保护
        setTimeout(() => {
            if (!isAnimating) {
                completeLoading();
            }
        }, 8000);
    });

})(); 