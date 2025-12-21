// 石榴煎酒计算器主逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const display = document.getElementById('display');
    const btn16 = document.getElementById('btn-16');
    const btnMinus = document.getElementById('btn-minus');
    const btn9 = document.getElementById('btn-9');
    const btnEquals = document.getElementById('btn-equals');
    const loadingSection = document.getElementById('loading-section');
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const videoSection = document.getElementById('video-section');
    const videoContainer = document.getElementById('video-container');
    const resultVideo = document.getElementById('result-video');

    // 状态变量
    let inputSequence = [];
    const correctSequence = ['16', '-', '9', '='];
    let isProcessing = false;
    let isVideoPlaying = false;
    let progressInterval = null;

    // 视频文件路径 - 可以根据需要修改
    const videoPath = '/mp4/16-9.mp4';

    // 启用/禁用按钮
    function setButtonsDisabled(disabled) {
        btn16.disabled = disabled;
        btnMinus.disabled = disabled;
        btn9.disabled = disabled;
        btnEquals.disabled = disabled;
        
        if (disabled) {
            btn16.style.opacity = '0.5';
            btn16.style.cursor = 'not-allowed';
            btnMinus.style.opacity = '0.5';
            btnMinus.style.cursor = 'not-allowed';
            btn9.style.opacity = '0.5';
            btn9.style.cursor = 'not-allowed';
            btnEquals.style.opacity = '0.5';
            btnEquals.style.cursor = 'not-allowed';
        } else {
            btn16.style.opacity = '1';
            btn16.style.cursor = 'pointer';
            btnMinus.style.opacity = '1';
            btnMinus.style.cursor = 'pointer';
            btn9.style.opacity = '1';
            btn9.style.cursor = 'pointer';
            btnEquals.style.opacity = '1';
            btnEquals.style.cursor = 'pointer';
        }
    }

    // 按钮点击处理
    function handleButtonClick(value) {
        if (isProcessing || isVideoPlaying) return;

        inputSequence.push(value);
        updateDisplay();

        // 检查当前序列是否正确
        const expectedValue = correctSequence[inputSequence.length - 1];
        if (value !== expectedValue) {
            // 序列错误，立即重置
            setTimeout(() => {
                resetCalculator();
            }, 300);
            return;
        }

        // 检查是否完成正确的序列
        if (inputSequence.length === correctSequence.length) {
            // 序列正确，开始加载视频
            startVideoLoading();
        }
    }

    // 更新显示
    function updateDisplay() {
        if (inputSequence.length === 0) {
            display.textContent = '16-9';
        } else {
            display.textContent = inputSequence.join('');
        }
    }

    // 开始加载视频
    function startVideoLoading() {
        isProcessing = true;
        
        // 禁用所有按钮
        setButtonsDisabled(true);
        
        // 显示加载区域
        loadingSection.classList.remove('hidden');
        videoSection.classList.add('hidden');
        
        // 重置进度条
        progressBar.style.width = '0%';
        
        // 更新加载文本（动态添加点）
        let dotCount = 3;
        const dotInterval = setInterval(() => {
            dotCount = (dotCount % 4) + 1;
            loadingText.textContent = '请求人工解析中' + '.'.repeat(dotCount);
        }, 500);
        
        // 模拟进度条循环动画（不停地循环）
        let progress = 0;
        let direction = 1; // 1表示增加，-1表示减少
        progressInterval = setInterval(() => {
            progress += direction * (Math.random() * 8 + 5);
            
            // 在0-100之间循环
            if (progress >= 100) {
                progress = 100;
                direction = -1;
            } else if (progress <= 0) {
                progress = 0;
                direction = 1;
            }
            
            progressBar.style.width = progress + '%';
        }, 150);

        // 模拟视频加载（2-4秒）
        const loadTime = 2000 + Math.random() * 2000;
        setTimeout(() => {
            clearInterval(progressInterval);
            clearInterval(dotInterval);
            // 快速完成进度条
            progressBar.style.width = '100%';
            loadingText.textContent = '请求人工解析中...';
            
            // 稍微延迟后加载视频
            setTimeout(() => {
                loadAndPlayVideo();
            }, 300);
        }, loadTime);
    }

    // 加载并播放视频
    function loadAndPlayVideo() {
        isVideoPlaying = true;
        isProcessing = false;
        
        // 隐藏加载区域
        loadingSection.classList.add('hidden');
        
        // 显示视频区域（保持显示）
        videoSection.classList.remove('hidden');
        
        // 设置视频源
        resultVideo.src = videoPath;
        resultVideo.style.display = 'block';
        
        // 加载视频
        resultVideo.load();
        
        // 播放视频
        resultVideo.play().catch(err => {
            console.error('视频播放失败:', err);
            // 播放失败时重新启用按钮
            isVideoPlaying = false;
            setButtonsDisabled(false);
        });

        // 监听视频播放结束
        resultVideo.addEventListener('ended', function() {
            // 视频播放完成后清零计算内容，但保持视频区域显示
            isVideoPlaying = false;
            inputSequence = [];
            updateDisplay();
            // 重新启用按钮，允许再次输入
            setButtonsDisabled(false);
        }, { once: true });
    }

    // 重置计算器（仅在序列错误时使用，视频播放完成后不使用此函数）
    function resetCalculator() {
        isProcessing = false;
        isVideoPlaying = false;
        inputSequence = [];
        updateDisplay();
        
        // 隐藏加载区域
        loadingSection.classList.add('hidden');
        
        // 不隐藏视频区域，保持显示
        
        // 清除进度条
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        progressBar.style.width = '0%';
        
        // 重新启用按钮
        setButtonsDisabled(false);
    }

    // 绑定按钮事件
    btn16.addEventListener('click', () => handleButtonClick('16'));
    btnMinus.addEventListener('click', () => handleButtonClick('-'));
    btn9.addEventListener('click', () => handleButtonClick('9'));
    btnEquals.addEventListener('click', () => handleButtonClick('='));

    // 初始化显示
    updateDisplay();
});

