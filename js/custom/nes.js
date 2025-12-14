// WebAudio输出类
class WebAudioOut {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.bufferSize = 4096;
        this.node = this.context.createScriptProcessor(this.bufferSize, 0, 2);
        this.node.onaudioprocess = this.onAudioProcess.bind(this);
        this.samplesL = [];
        this.samplesR = [];
        this.node.connect(this.context.destination);
    }
    pushSample(l, r) {
        this.samplesL.push(l);
        this.samplesR.push(r);
    }
    onAudioProcess(e) {
        const outL = e.outputBuffer.getChannelData(0);
        const outR = e.outputBuffer.getChannelData(1);
        for (let i = 0; i < outL.length; i++) {
            outL[i] = this.samplesL.length ? this.samplesL.shift() : 0;
            outR[i] = this.samplesR.length ? this.samplesR.shift() : 0;
        }
    }
    start() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

window.onload = function() {
    const audio = new WebAudioOut();
    const canvas = document.getElementById('nes-canvas');
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const nes = new jsnes.NES({
        onFrame: function(frameBuffer) {
            const imageData = ctx.getImageData(0, 0, 256, 240);
            for (let i = 0; i < frameBuffer.length; i++) {
                imageData.data[i * 4 + 0] = (frameBuffer[i] >> 16) & 0xFF;
                imageData.data[i * 4 + 1] = (frameBuffer[i] >> 8) & 0xFF;
                imageData.data[i * 4 + 2] = frameBuffer[i] & 0xFF;
                imageData.data[i * 4 + 3] = 0xFF;
            }
            ctx.putImageData(imageData, 0, 0);
        },
        onAudioSample: function(l, r) {
            audio.pushSample(l, r);
        }
    });

    let romBuffer = null;
    let isValidNES = false;
    let isRunning = false;

    const loadBtn = document.getElementById('load-rom');
    const stopBtn = document.getElementById('stop-rom');
    const fileInput = document.getElementById('rom-file');
    const romSelect = document.getElementById('rom-select');

    function clearScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function resetUpload() {
        fileInput.value = '';
        if (romSelect) {
            romSelect.value = '';
        }
    }
    
    // 加载 ROM 数据的通用函数
    function loadROMFromBuffer(buffer) {
        const arr = new Uint8Array(buffer);
        console.log('前16字节:', arr.slice(0, 16));
        console.log('ROM长度:', arr.length);
        if (arr[0] === 0x4E && arr[1] === 0x45 && arr[2] === 0x53 && arr[3] === 0x1A) {
            const decoder = new TextDecoder('x-user-defined');
            romBuffer = decoder.decode(arr);
            isValidNES = true;
            loadBtn.disabled = false;
            return true;
        } else {
            romBuffer = null;
            isValidNES = false;
            alert('不是有效的NES ROM文件！');
            return false;
        }
    }
    
    // 初始状态
    loadBtn.style.display = '';
    loadBtn.disabled = true;
    stopBtn.style.display = 'none';
    stopBtn.disabled = true;

    // 下拉菜单选择处理
    if (romSelect) {
        romSelect.onchange = function(e) {
            const selectedFile = e.target.value;
            if (!selectedFile) {
                // 如果选择"请选择游戏"，重置状态
                romBuffer = null;
                isValidNES = false;
                loadBtn.disabled = true;
                fileInput.value = ''; // 清空文件输入
                return;
            }
            
            // 禁用加载按钮，显示加载中
            loadBtn.disabled = true;
            loadBtn.textContent = '加载中...';
            
            // 从服务器加载 ROM 文件
            const romPath = '/ROM/' + encodeURIComponent(selectedFile);
            fetch(romPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('ROM文件加载失败: ' + response.status);
                    }
                    return response.arrayBuffer();
                })
                .then(buffer => {
                    if (loadROMFromBuffer(buffer)) {
                        // 加载成功，清空文件输入
                        fileInput.value = '';
                        loadBtn.textContent = '加载游戏';
                    } else {
                        loadBtn.textContent = '加载游戏';
                    }
                })
                .catch(error => {
                    console.error('加载ROM失败:', error);
                    alert('加载ROM文件失败: ' + error.message);
                    loadBtn.textContent = '加载游戏';
                    loadBtn.disabled = true;
                    romBuffer = null;
                    isValidNES = false;
                });
            
            // 状态重置
            loadBtn.style.display = '';
            stopBtn.style.display = 'none';
            stopBtn.disabled = true;
        };
    }

    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        loadBtn.disabled = true;
        isValidNES = false;
        
        // 清空下拉菜单选择
        if (romSelect) {
            romSelect.value = '';
        }
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                loadROMFromBuffer(ev.target.result);
            };
            reader.readAsArrayBuffer(file);
        } else {
            romBuffer = null;
            isValidNES = false;
        }
        // 状态重置
        loadBtn.style.display = '';
        stopBtn.style.display = 'none';
        stopBtn.disabled = true;
    };

    loadBtn.onclick = function() {
        audio.start(); // 用户交互时启动音频
        if (romBuffer && isValidNES && !isRunning) {
            nes.reset();
            nes.loadROM(romBuffer);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            function onAnimationFrame() {
                nes.frame();
                animationFrameId = requestAnimationFrame(onAnimationFrame);
            }
            onAnimationFrame();
            isRunning = true;
            loadBtn.style.display = 'none';
            stopBtn.style.display = '';
            stopBtn.disabled = false;
        } else {
            alert('请先上传有效的NES ROM文件');
        }
    };

    stopBtn.onclick = function() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        isRunning = false;
        loadBtn.style.display = '';
        loadBtn.disabled = true;
        loadBtn.textContent = '加载游戏'; // 恢复按钮文本
        stopBtn.style.display = 'none';
        stopBtn.disabled = true;
        clearScreen();
        resetUpload();
        romBuffer = null;
        isValidNES = false;
    };

    // 键盘映射
    const keyMap = {
        38: 4, // Up
        40: 5, // Down
        37: 6, // Left
        39: 7, // Right
        13: 3, // Start
        16: 2  // Select
    };

    const BUTTON_A = 0;
    const BUTTON_B = 1;

    // 二号手柄映射（WASD+Q/E/R/T）
    const keyMapP2 = {
        87: 'UP',      // W
        83: 'DOWN',    // S
        65: 'LEFT',    // A
        68: 'RIGHT',   // D
        81: 'A',       // Q
        69: 'B',       // E
        82: 'START',   // R
        84: 'SELECT'   // T
    };

    window.addEventListener('keydown', function(e) {
        // 1P
        if (e.keyCode === 90) { // Z
            console.log('Z键down', BUTTON_A);
            nes.buttonDown(1, BUTTON_A);
            e.preventDefault();
            return;
        }
        if (e.keyCode === 88) { // X
            console.log('X键down', BUTTON_B);
            nes.buttonDown(1, BUTTON_B);
            e.preventDefault();
            return;
        }
        if (keyMap[e.keyCode]) {
            nes.buttonDown(1, keyMap[e.keyCode]);
            e.preventDefault();
        }
        // 2P
        if (keyMapP2[e.keyCode]) {
            let btn = keyMapP2[e.keyCode];
            let btnNum = 0;
            switch(btn) {
                case 'UP': btnNum = 4; break;
                case 'DOWN': btnNum = 5; break;
                case 'LEFT': btnNum = 6; break;
                case 'RIGHT': btnNum = 7; break;
                case 'A': btnNum = BUTTON_A; break;
                case 'B': btnNum = BUTTON_B; break;
                case 'START': btnNum = 3; break;
                case 'SELECT': btnNum = 8; break;
            }
            if (btnNum) {
                nes.buttonDown(2, btnNum);
                e.preventDefault();
            }
        }
    });
    window.addEventListener('keyup', function(e) {
        // 1P
        if (e.keyCode === 90) { // Z
            console.log('Z键up', BUTTON_A);
            nes.buttonUp(1, BUTTON_A);
            e.preventDefault();
            return;
        }
        if (e.keyCode === 88) { // X
            console.log('X键up', BUTTON_B);
            nes.buttonUp(1, BUTTON_B);
            e.preventDefault();
            return;
        }
        if (keyMap[e.keyCode]) {
            nes.buttonUp(1, keyMap[e.keyCode]);
            e.preventDefault();
        }
        // 2P
        if (keyMapP2[e.keyCode]) {
            let btn = keyMapP2[e.keyCode];
            let btnNum = 0;
            switch(btn) {
                case 'UP': btnNum = 4; break;
                case 'DOWN': btnNum = 5; break;
                case 'LEFT': btnNum = 6; break;
                case 'RIGHT': btnNum = 7; break;
                case 'A': btnNum = BUTTON_A; break;
                case 'B': btnNum = BUTTON_B; break;
                case 'START': btnNum = 3; break;
                case 'SELECT': btnNum = 8; break;
            }
            if (btnNum) {
                nes.buttonUp(2, btnNum);
                e.preventDefault();
            }
        }
    });
};

