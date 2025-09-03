/**
 * 文章统计图显示控制脚本
 * 根据页面类型和用户行为控制统计图的显示
 */

(function() {
    'use strict';
    
    // 检测当前页面类型
    function detectPageType() {
        const path = window.location.pathname;
        
        // 归档页面 (/archives/)
        if (path === '/archives/' || path === '/archives' || path === '/archives/index.html') {
            return 'archives-index';
        }
        
        // 具体月份页面 (/archives/2024/10/)
        if (path.startsWith('/archives/') && path !== '/archives/' && path !== '/archives' && path !== '/archives/index.html') {
            return 'archive-page';
        }
        
        return 'other';
    }
    
    // 控制统计图显示
    function controlChartDisplay() {
        const pageType = detectPageType();
        const chartElement = document.getElementById('posts-chart');
        
        console.log('控制文章统计图显示:', {
            path: window.location.pathname,
            pageType: pageType,
            chartElement: !!chartElement
        });
        
        if (!chartElement) {
            console.log('文章统计图元素不存在 - 可能是具体月份页面');
            return;
        }
        
        if (pageType === 'archives-index') {
            // 归档页面：确保统计图完全显示
            chartElement.style.display = 'block';
            chartElement.style.height = '300px';
            chartElement.style.padding = '10px';
            chartElement.style.margin = '0';
            chartElement.style.overflow = 'visible';
            chartElement.style.visibility = 'visible';
            console.log('显示文章统计图 - 归档页面:', window.location.pathname);
        } else if (pageType === 'archive-page') {
            // 具体月份页面：隐藏统计图
            chartElement.style.display = 'none';
            chartElement.style.height = '0';
            chartElement.style.padding = '0';
            chartElement.style.margin = '0';
            chartElement.style.overflow = 'hidden';
            chartElement.style.visibility = 'hidden';
            console.log('隐藏文章统计图 - 具体月份页面:', window.location.pathname);
        }
    }
    
    // 重新创建文章统计图
    function recreatePostsChart() {
        const chartElement = document.getElementById('posts-chart');
        if (!chartElement || typeof echarts === 'undefined') {
            console.log('无法重新创建文章图表：元素不存在或ECharts未加载');
            return;
        }
        
        // 检查是否已经有图表脚本
        const existingScript = document.getElementById('postsChart');
        if (existingScript) {
            existingScript.remove();
        }
        
        // 重新获取文章数据并创建图表
        fetch(window.location.pathname)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const chartScript = doc.getElementById('postsChart');
                
                if (chartScript) {
                    // 将脚本添加到当前页面
                    const newScript = document.createElement('script');
                    newScript.id = 'postsChart';
                    newScript.textContent = chartScript.textContent;
                    document.body.appendChild(newScript);
                    console.log('文章统计图已重新创建');
                } else {
                    console.log('未找到文章图表脚本');
                }
            })
            .catch(error => {
                console.error('重新创建文章图表失败:', error);
            });
    }
    
    // 监听页面变化（PJAX支持）
    function handlePageChange() {
        console.log('文章页面变化检测:', window.location.pathname);
        
        // 延迟执行，确保DOM完全更新
        setTimeout(() => {
            controlChartDisplay();
            
            // 重新初始化ECharts（如果需要）
            const pageType = detectPageType();
            if (pageType === 'archives-index') {
                // 在归档页面，确保ECharts正确显示
                setTimeout(() => {
                    // 尝试重新初始化图表
                    if (window.postsChart && typeof window.postsChart.resize === 'function') {
                        window.postsChart.resize();
                        console.log('ECharts文章图表已调整大小');
                    } else {
                        // 如果图表实例不存在，重新创建图表
                        console.log('文章图表实例不存在，尝试重新创建');
                        recreatePostsChart();
                    }
                }, 200);
            }
        }, 100);
    }
    
    // 监听浏览器后退/前进
    window.addEventListener('popstate', handlePageChange);
    
    // 监听PJAX事件（如果使用PJAX）
    if (window.pjax) {
        document.addEventListener('pjax:complete', handlePageChange);
        document.addEventListener('pjax:success', handlePageChange);
    }
    
    // 监听所有可能的页面变化事件
    document.addEventListener('DOMContentLoaded', handlePageChange);
    window.addEventListener('load', handlePageChange);
    
    // 监听自定义图表重新初始化事件
    document.addEventListener('posts-chart-reinit', function() {
        console.log('收到文章图表重新初始化事件');
        recreatePostsChart();
    });
    
    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', controlChartDisplay);
    } else {
        controlChartDisplay();
    }
    
    // 立即执行一次，确保页面加载时就能正确显示
    setTimeout(controlChartDisplay, 0);
    
    // 暴露控制函数供外部调用
    window.postsChartControl = {
        show: function() {
            const chartElement = document.getElementById('posts-chart');
            if (chartElement) {
                // 重置样式确保完全显示
                chartElement.style.display = 'block';
                chartElement.style.height = '300px';
                chartElement.style.padding = '10px';
                chartElement.style.margin = '0';
                chartElement.style.overflow = 'visible';
                chartElement.style.visibility = 'visible';
            }
        },
        refresh: function() {
            controlChartDisplay();
        },
        recreate: function() {
            recreatePostsChart();
        }
    };
    
})();
