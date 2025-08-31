/**
 * 弹幕页面简单版本JavaScript
 * 直接实现弹幕显示功能
 */

console.log('弹幕页面简单版本JavaScript已加载');

// 简单的弹幕数据
const mockComments = [
    { nick: '访客1', content: '这个博客很不错！' },
    { nick: '访客2', content: '学到了很多知识，感谢分享！' },
    { nick: '访客3', content: '弹幕功能很有趣！' },
    { nick: '访客4', content: '期待更多精彩内容！' },
    { nick: '访客5', content: '主题设计很棒！' },
    { nick: '访客6', content: '继续加油！' },
    { nick: '访客7', content: '支持博主！' },
    { nick: '访客8', content: '学到了！' }
];

// 显示弹幕函数
function showBarrage() {
    console.log('showBarrage函数被调用');
    const barrageElement = document.getElementById('barrage');
    console.log('弹幕容器元素:', barrageElement);
    
    if (!barrageElement) {
        console.error('弹幕容器不存在');
        return;
    }
    
    // 显示容器
    barrageElement.classList.remove('hide');
    console.log('显示弹幕容器');
    
    // 清空现有内容
    barrageElement.innerHTML = '';
    
    // 创建弹幕项
    mockComments.forEach((comment, index) => {
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
    
    console.log('弹幕创建完成，共', mockComments.length, '条');
}

// 隐藏弹幕函数
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，检查弹幕页面');
    const barrageElement = document.getElementById('barrage');
    if (barrageElement) {
        console.log('弹幕页面检测成功');
    } else {
        console.log('不在弹幕页面');
    }
});

// 立即检查
if (document.readyState === 'loading') {
    console.log('页面还在加载中');
} else {
    console.log('页面已加载完成');
    const barrageElement = document.getElementById('barrage');
    if (barrageElement) {
        console.log('弹幕页面检测成功（立即检查）');
    }
}
