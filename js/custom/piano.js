// Tailwind 配置
 tailwind.config = {
     theme: {
         extend: {
             colors: {
                 primary: '#FF0000',
                 piano: {
                     black: '#000000',
                     white: '#FFFFFF',
                     accent: '#333333'
                 }
             },
             fontFamily: {
                 sans: ['Inter', 'system-ui', 'sans-serif'],
             },
         }
     }
 }

// 其余 JS 逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 动态生成钢琴键盘
    function createPianoKeys() {
        const whiteKeysGroup = document.getElementById('white-keys');
        const blackKeysGroup = document.getElementById('black-keys');
        
        // 白键数据
        const whiteKeys = [
            { note: "A0", x: 59, hover: "var(--white-key-hover-A0)" },
            { note: "B0", x: 76, hover: "var(--white-key-hover-B0)" },
            { note: "C1", x: 93, hover: "var(--white-key-hover-C1)" },
            { note: "D1", x: 110, hover: "var(--white-key-hover-D1)" },
            { note: "E1", x: 127, hover: "var(--white-key-hover-E1)" },
            { note: "F1", x: 144, hover: "var(--white-key-hover-F1)" },
            { note: "G1", x: 161, hover: "var(--white-key-hover-G1)" },
            { note: "A1", x: 178, hover: "var(--white-key-hover-A1)" },
            { note: "B1", x: 195, hover: "var(--white-key-hover-B1)" },
            { note: "C2", x: 212, hover: "var(--white-key-hover-C2)" },
            { note: "D2", x: 229, hover: "var(--white-key-hover-D2)" },
            { note: "E2", x: 246, hover: "var(--white-key-hover-E2)" },
            { note: "F2", x: 263, hover: "var(--white-key-hover-F2)" },
            { note: "G2", x: 280, hover: "var(--white-key-hover-G2)" },
            { note: "A2", x: 297, hover: "var(--white-key-hover-A2)" },
            { note: "B2", x: 314, hover: "var(--white-key-hover-B2)" },
            { note: "C3", x: 331, hover: "var(--white-key-hover-C3)" },
            { note: "D3", x: 348, hover: "var(--white-key-hover-D3)" },
            { note: "E3", x: 365, hover: "var(--white-key-hover-E3)" },
            { note: "F3", x: 382, hover: "var(--white-key-hover-F3)" },
            { note: "G3", x: 399, hover: "var(--white-key-hover-G3)" },
            { note: "A3", x: 416, hover: "var(--white-key-hover-A3)" },
            { note: "B3", x: 433, hover: "var(--white-key-hover-B3)" },
            { note: "C4", x: 450, hover: "var(--white-key-hover-C4)" },
            { note: "D4", x: 467, hover: "var(--white-key-hover-D4)" },
            { note: "E4", x: 484, hover: "var(--white-key-hover-E4)" },
            { note: "F4", x: 501, hover: "var(--white-key-hover-F4)" },
            { note: "G4", x: 518, hover: "var(--white-key-hover-G4)" },
            { note: "A4", x: 535, hover: "var(--white-key-hover-A4)" },
            { note: "B4", x: 552, hover: "var(--white-key-hover-B4)" },
            { note: "C5", x: 569, hover: "var(--white-key-hover-C5)" },
            { note: "D5", x: 586, hover: "var(--white-key-hover-D5)" },
            { note: "E5", x: 603, hover: "var(--white-key-hover-E5)" },
            { note: "F5", x: 620, hover: "var(--white-key-hover-F5)" },
            { note: "G5", x: 637, hover: "var(--white-key-hover-G5)" },
            { note: "A5", x: 654, hover: "var(--white-key-hover-A5)" },
            { note: "B5", x: 671, hover: "var(--white-key-hover-B5)" },
            { note: "C6", x: 688, hover: "var(--white-key-hover-C6)" },
            { note: "D6", x: 705, hover: "var(--white-key-hover-D6)" },
            { note: "E6", x: 722, hover: "var(--white-key-hover-E6)" },
            { note: "F6", x: 739, hover: "var(--white-key-hover-F6)" },
            { note: "G6", x: 756, hover: "var(--white-key-hover-G6)" },
            { note: "A6", x: 773, hover: "var(--white-key-hover-A6)" },
            { note: "B6", x: 790, hover: "var(--white-key-hover-B6)" },
            { note: "C7", x: 807, hover: "var(--white-key-hover-C7)" },
            { note: "D7", x: 824, hover: "var(--white-key-hover-D7)" },
            { note: "E7", x: 841, hover: "var(--white-key-hover-E7)" },
            { note: "F7", x: 858, hover: "var(--white-key-hover-F7)" },
            { note: "G7", x: 875, hover: "var(--white-key-hover-G7)" },
            { note: "A7", x: 892, hover: "var(--white-key-hover-A7)" },
            { note: "B7", x: 909, hover: "var(--white-key-hover-B7)" },
            { note: "C8", x: 926, hover: "var(--white-key-hover-C8)" }
        ];
        
        // 黑键数据
        const blackKeys = [
            { note: "A#0", x: 70.5, hover: "var(--black-key-hover-As0)" },
            { note: "C#1", x: 104.5, hover: "var(--black-key-hover-Cs1)" },
            { note: "D#1", x: 121.5, hover: "var(--black-key-hover-Ds1)" },
            { note: "F#1", x: 155.5, hover: "var(--black-key-hover-Fs1)" },
            { note: "G#1", x: 172.5, hover: "var(--black-key-hover-Gs1)" },
            { note: "A#1", x: 189.5, hover: "var(--black-key-hover-As1)" },
            { note: "C#2", x: 223.5, hover: "var(--black-key-hover-Cs2)" },
            { note: "D#2", x: 240.5, hover: "var(--black-key-hover-Ds2)" },
            { note: "F#2", x: 274.5, hover: "var(--black-key-hover-Fs2)" },
            { note: "G#2", x: 291.5, hover: "var(--black-key-hover-Gs2)" },
            { note: "A#2", x: 308.5, hover: "var(--black-key-hover-As2)" },
            { note: "C#3", x: 342.5, hover: "var(--black-key-hover-Cs3)" },
            { note: "D#3", x: 359.5, hover: "var(--black-key-hover-Ds3)" },
            { note: "F#3", x: 393.5, hover: "var(--black-key-hover-Fs3)" },
            { note: "G#3", x: 410.5, hover: "var(--black-key-hover-Gs3)" },
            { note: "A#3", x: 427.5, hover: "var(--black-key-hover-As3)" },
            { note: "C#4", x: 461.5, hover: "var(--black-key-hover-Cs4)" },
            { note: "D#4", x: 478.5, hover: "var(--black-key-hover-Ds4)" },
            { note: "F#4", x: 512.5, hover: "var(--black-key-hover-Fs4)" },
            { note: "G#4", x: 529.5, hover: "var(--black-key-hover-Gs4)" },
            { note: "A#4", x: 546.5, hover: "var(--black-key-hover-As4)" },
            { note: "C#5", x: 580.5, hover: "var(--black-key-hover-Cs5)" },
            { note: "D#5", x: 597.5, hover: "var(--black-key-hover-Ds5)" },
            { note: "F#5", x: 631.5, hover: "var(--black-key-hover-Fs5)" },
            { note: "G#5", x: 648.5, hover: "var(--black-key-hover-Gs5)" },
            { note: "A#5", x: 665.5, hover: "var(--black-key-hover-As5)" },
            { note: "C#6", x: 699.5, hover: "var(--black-key-hover-Cs6)" },
            { note: "D#6", x: 716.5, hover: "var(--black-key-hover-Ds6)" },
            { note: "F#6", x: 750.5, hover: "var(--black-key-hover-Fs6)" },
            { note: "G#6", x: 767.5, hover: "var(--black-key-hover-Gs6)" },
            { note: "A#6", x: 784.5, hover: "var(--black-key-hover-As6)" },
            { note: "C#7", x: 818.5, hover: "var(--black-key-hover-Cs7)" },
            { note: "D#7", x: 835.5, hover: "var(--black-key-hover-Ds7)" },
            { note: "F#7", x: 869.5, hover: "var(--black-key-hover-Fs7)" },
            { note: "G#7", x: 886.5, hover: "var(--black-key-hover-Gs7)" },
            { note: "A#7", x: 903.5, hover: "var(--black-key-hover-As7)" }
        ];
        
        // 创建白键
        whiteKeys.forEach(key => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'white-key key-shadow cursor-pointer hover:key-active transition-all duration-150');
            rect.setAttribute('data-hover', key.hover);
            rect.setAttribute('data-note', key.note);
            rect.setAttribute('fill', 'white');
            rect.setAttribute('height', '120');
            rect.setAttribute('rx', '4');
            rect.setAttribute('ry', '4');
            rect.setAttribute('stroke', 'black');
            rect.setAttribute('width', '16');
            rect.setAttribute('x', key.x);
            rect.setAttribute('y', '222');
            whiteKeysGroup.appendChild(rect);
        });
        
        // 创建黑键
        blackKeys.forEach(key => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'black-key black-key-shadow cursor-pointer hover:key-active transition-all duration-150');
            rect.setAttribute('data-hover', key.hover);
            rect.setAttribute('data-note', key.note);
            rect.setAttribute('fill', 'black');
            rect.setAttribute('height', '80');
            rect.setAttribute('rx', '2');
            rect.setAttribute('ry', '2');
            rect.setAttribute('stroke', 'black');
            rect.setAttribute('width', '10');
            rect.setAttribute('x', key.x);
            rect.setAttribute('y', '222');
            blackKeysGroup.appendChild(rect);
        });
    }
    
    // 调用函数创建键盘
    createPianoKeys();
    
    // 修复采样文件映射，确保所有88个音符都有对应文件
    let pianoReady = false;

    const piano = new Tone.Sampler({
        urls: {
            "A0": "A0.mp3",
            "C1": "C1.mp3",
            "D#1": "Ds1.mp3",
            "F#1": "Fs1.mp3",
            "A1": "A1.mp3",
            "C2": "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            "A2": "A2.mp3",
            "C3": "C3.mp3",
            "D#3": "Ds3.mp3",
            "F#3": "Fs3.mp3",
            "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            "A6": "A6.mp3",
            "C7": "C7.mp3",
            "D#7": "Ds7.mp3",
            "F#7": "Fs7.mp3",
            "A7": "A7.mp3",
            "C8": "C8.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1,
        onload: () => {
            pianoReady = true;
            console.log("🎹 Sampler 加载完成，可以播放和弦");
        }
    }).toDestination();

    // MIDI相关变量
    let midiFile = null;
    let midiEvents = [];
    let currentEventIndex = 0;
    let isPlaying = false;
    let midiLoaded = false;
    let totalDuration = 0;
    let pausedTime = 0;
    let progressInterval = null;
    let tempoMap = []; // 存储速度变化信息
    let isMouseDown = false;
    let currentPressedKey = null;

    // 琴键交互逻辑
    const keys = document.querySelectorAll('#piano rect[data-note]');
    keys.forEach(key => {
        key.addEventListener('mousedown', async function (e) {
            // 不要阻止默认事件，除非有特殊需求
            if (Tone.context.state !== 'running') await Tone.start();

            isMouseDown = true;
            playNote(this.dataset.note);
            applyKeyActiveVisual(this);

            if (currentPressedKey && currentPressedKey !== this) {
                releaseKeyActiveVisual(currentPressedKey);
            }
            currentPressedKey = this;
        });

        key.addEventListener('mouseup', function () {
            isMouseDown = false;
            releaseKeyActiveVisual(this);
            currentPressedKey = null;
        });

        key.addEventListener('mouseleave', function () {
            if (!isMouseDown) {
                releaseKeyActiveVisual(this);
                currentPressedKey = null;
            }
        });

        key.addEventListener('mouseover', function () {
            if (!isMouseDown) return;

            if (currentPressedKey && currentPressedKey !== this) {
                releaseKeyActiveVisual(currentPressedKey);
            }

            playNote(this.dataset.note);
            applyKeyActiveVisual(this);
            currentPressedKey = this;
        });

        key.addEventListener('mouseenter', function() {
            if (isMouseDown) return;
            applyKeyActiveVisual(this);
        });

        key.addEventListener('mouseleave', function() {
            if (isMouseDown) return;
            releaseKeyActiveVisual(this);
        });
    });

    // 防止鼠标在键外抬起时，所有琴键都能回弹
    document.addEventListener('mouseup', function () {
        isMouseDown = false;
        keys.forEach(key => releaseKeyActiveVisual(key));
        currentPressedKey = null;
    });
    
    // 防止文本选择
    document.getElementById('piano').addEventListener('selectstart', e => e.preventDefault());
    
    // 播放音符
    function playNote(note, duration = '8n') {
        if (!pianoReady) return;

        if (Array.isArray(note)) {
            const validNotes = note.filter(n => /^[A-G](#|b)?[0-8]$/.test(n));
            if (validNotes.length === 0) return;
            try {
                piano.triggerAttackRelease(validNotes, duration);
            } catch (err) {
                console.error('播放和弦失败:', err, 'note=', validNotes);
            }
        } else if (typeof note === 'string') {
            if (!note.match(/^[A-G](#|b)?[0-8]$/)) return;
            try {
                piano.triggerAttackRelease(note, duration);
            } catch (err) {
                console.error('播放单音失败:', err, 'note=', note);
            }
        }
    }
    
    // 加载MIDI文件的通用函数
    function loadMidiFromBuffer(arrayBuffer, fileName) {
        try {
            const midi = new Midi(arrayBuffer); // Tonejs.Midi
            midiFile = midi;
            midiEvents = extractMidiEvents(midi); // 必须执行
            totalDuration = midiEvents[midiEvents.length - 1]?.time || 0;
            console.log('🎹 前10个MIDI事件样本:', midiEvents.slice(0, 10));

            updateTotalTime(totalDuration);
            document.getElementById('play-btn').disabled = false;
            document.getElementById('stop-btn').disabled = false;
            document.getElementById('progress-bar').disabled = false; 
            midiLoaded = true;

            console.log('MIDI文件加载完成，点击播放开始');
            console.log(midi); // 输出调试信息
        } catch (err) {
            alert('MIDI 解析失败: ' + err.message);
        }
    }
    
    // 文件上传处理
    document.getElementById('midi-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 清空下拉菜单选择
        const midiSelect = document.getElementById('midi-select');
        if (midiSelect) {
            midiSelect.value = '';
        }
        
        console.log(`选择的文件: ${file.name}, 大小: ${formatFileSize(file.size)}`);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            loadMidiFromBuffer(e.target.result, file.name);
        };
        
        reader.onerror = function() {
            console.log('文件读取错误', true);
            alert('读取文件时发生错误');
        };
        
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                console.log(`正在读取文件: ${Math.round((e.loaded / e.total) * 100)}%`);
            }
        };
        
        reader.readAsArrayBuffer(file);
    });
    
    // 下拉菜单选择处理
    const midiSelect = document.getElementById('midi-select');
    if (midiSelect) {
        midiSelect.addEventListener('change', function(e) {
            const selectedFile = e.target.value;
            if (!selectedFile) {
                // 如果选择"请选择MIDI文件"，重置状态
                midiFile = null;
                midiEvents = [];
                midiLoaded = false;
                totalDuration = 0;
                document.getElementById('play-btn').disabled = true;
                document.getElementById('stop-btn').disabled = true;
                document.getElementById('progress-bar').disabled = true;
                document.getElementById('midi-file').value = ''; // 清空文件输入
                return;
            }
            
            // 从服务器加载 MIDI 文件
            const midiPath = '/MIDI/' + encodeURIComponent(selectedFile);
            console.log('正在加载MIDI文件:', midiPath);
            
            fetch(midiPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('MIDI文件加载失败: ' + response.status);
                    }
                    return response.arrayBuffer();
                })
                .then(buffer => {
                    console.log(`MIDI文件加载成功: ${selectedFile}, 大小: ${formatFileSize(buffer.byteLength)}`);
                    loadMidiFromBuffer(buffer, selectedFile);
                })
                .catch(error => {
                    console.error('加载MIDI失败:', error);
                    alert('加载MIDI文件失败: ' + error.message);
                    midiFile = null;
                    midiEvents = [];
                    midiLoaded = false;
                    document.getElementById('play-btn').disabled = true;
                    document.getElementById('stop-btn').disabled = true;
                    document.getElementById('progress-bar').disabled = true;
                });
        });
    }
    
    // 播放控制
    document.getElementById('play-btn').addEventListener('click', async function () {
        if (!pianoReady) {
            alert("钢琴声音尚未加载完成，请稍后再试！");
            return;
        }

        if (!midiLoaded || !midiEvents.length) {
            alert('请先上传有效的 MIDI 文件！');
            return;
        }

        // 确保音频上下文激活
        if (Tone.context.state !== 'running') {
            await Tone.start();
            console.log('Tone.js 音频上下文已激活');
        }

        if (isPlaying) {
            pauseMidi();
        } else {
            playMidi();
        }
    });
    
    // 停止播放
    document.getElementById('stop-btn').addEventListener('click', function() {
        stopMidi();

        // 清除上传文件输入框
        const midiFileInput = document.getElementById('midi-file');
        midiFileInput.value = ''; 
        
        // 清空下拉菜单选择
        const midiSelect = document.getElementById('midi-select');
        if (midiSelect) {
            midiSelect.value = '';
        }

        // 重置相关 MIDI 状态变量
        midiFile = null;
        midiEvents = [];
        midiLoaded = false;
        totalDuration = 0;
        pausedTime = 0;
        
        // 禁用播放停止按钮和进度条
        document.getElementById('play-btn').disabled = true;
        document.getElementById('stop-btn').disabled = true;
        const progressBar = document.getElementById('progress-bar');
        progressBar.disabled = true;
        progressBar.value = 0;

        // 更新时间显示回0
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('total-time').textContent = '0:00';
    });

    // 进度条控制
    document.getElementById('progress-bar').addEventListener('input', function() {
        if (!midiEvents.length) return;
        
        const percent = this.value / 100;
        const newTime = totalDuration * percent;
        seekToTime(newTime);
    });
    
    // 从MIDI文件中提取音符事件
    function extractMidiEvents(midiFile) {
        console.log('开始提取MIDI事件...');

        const events = [];

        midiFile.tracks.forEach((track, trackIndex) => {
            console.log(`Track ${trackIndex}: notes count = ${track.notes.length}`);

            if (!track.notes || track.notes.length === 0) return;

            track.notes.forEach(note => {
                if (!note.name || typeof note.name !== 'string') {
                    console.warn('跳过无效音符:', note);
                    return;
                }

                events.push({
                    time: note.time,
                    note: note.name,
                    midiNote: note.midi,
                    velocity: note.velocity,
                    duration: note.duration
                });
            });
        });

        console.log(`已提取 ${events.length} 个音符事件`);
        return events.sort((a, b) => a.time - b.time);
    }
    
    // 开始播放MIDI
    function startMidi() {
        console.log('开始播放MIDI...');
        
        // 确保音频上下文已启动
        if (Tone.context.state !== 'running') {
            console.log('启动音频上下文...');
            Tone.start().then(() => {
                console.log('音频上下文已启动');
                playMidi();
            }).catch(error => {
                console.log(`启动音频上下文失败: ${error.message}`, true);
                alert('无法启动音频上下文: ' + error.message);
            });
        } else {
            playMidi();
        }
    }
    
    // 实际播放MIDI
    function playMidi() {
        // 取消之前的 Tone.Transport 上调度
        Tone.Transport.cancel();

        if (pausedTime > 0) {
            // 从暂停点继续播放
            Tone.Transport.seconds = pausedTime;
        } else {
            Tone.Transport.position = 0;
        }

        // 清除上次播放残留代码块和动画状态
        clearCodeBlocks();
        activeCodeBlocks = [];

        // 一次性创建所有代码块控制对象（瀑布动画）
        midiEvents.forEach(event => {
            createCodeBlock(event.note, event.time, event.duration || 0.5);
        });

        // 启动代码块动画
        animateCodeBlocks();

        // 使用 Tone.Transport.schedule 调度音符播放
        midiEvents.forEach(event => {
            Tone.Transport.schedule(time => {
                playNote(event.note, event.duration || 0.5);
            }, event.time);
        });

        // 启动 Tone.Transport ，开始播放
        Tone.Transport.start();

        isPlaying = true;
        document.getElementById('play-btn').innerHTML = '<i class="fa fa-pause"></i> 暂停';

        // 同时开启进度条更新等
        startProgressUpdates();
    }
    
    // 暂停播放MIDI
    function pauseMidi() {
        pausedTime = Tone.Transport.seconds; 
        Tone.Transport.pause();
        isPlaying = false;
        document.getElementById('play-btn').innerHTML = '<i class="fa fa-play"></i> 继续';
        stopProgressUpdates();
    }
    
    // 停止播放MIDI
    function stopMidi() {
        Tone.Transport.stop();
        isPlaying = false;
        currentEventIndex = 0;
        pausedTime = 0;

        // 清除所有动态代码块
        clearCodeBlocks();

        // 重置UI状态
        document.getElementById('play-btn').innerHTML = '<i class="fa fa-play"></i> 播放';
        document.getElementById('stop-btn').disabled = true;
        updateProgressBar(0);
        updateCurrentTime(0);
        stopProgressUpdates();
        resetAllKeys();
    }
    
    // 开始定期更新进度条
    function startProgressUpdates() {
        stopProgressUpdates(); // 清除旧监听

        progressInterval = Tone.Transport.scheduleRepeat((time) => {
            Tone.Draw.schedule(() => {
                const currentTime = Tone.Transport.seconds;
                const percent = (currentTime / totalDuration) * 100;

                updateProgressBar(percent);
                updateCurrentTime(currentTime);

                if (currentTime >= totalDuration) {
                    stopMidi();
                }
            }, time);
        }, '64n');
    }
    
    // 停止进度更新
    function stopProgressUpdates() {
        if (progressInterval != null) {
            Tone.Transport.clear(progressInterval);
            progressInterval = null;
        }
    }
    
    // 重置所有琴键状态
    function resetAllKeys() {
        document.querySelectorAll('#piano rect[data-note]').forEach(key => {
            key.classList.remove('key-active');
            key.style.fill = '';
        });
    }
    
    // 更新进度条
    function updateProgressBar(percent) {
        const progressBar = document.getElementById('progress-bar');
        progressBar.value = Math.min(100, Math.max(0, percent));
    }
    
    // 更新当前时间显示
    function updateCurrentTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        document.getElementById('current-time').textContent = `${minutes}:${seconds}`;
    }
    
    // 更新总时间显示
    function updateTotalTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        document.getElementById('total-time').textContent = `${minutes}:${seconds}`;
    }
    
    // 跳转到指定时间
    function seekToTime(time) {
        if (!midiEvents.length) return;

        const wasPlaying = isPlaying;
        if (wasPlaying) {
            Tone.Transport.pause();
            stopProgressUpdates();
        }

        clearCodeBlocks();
        resetAllKeys();

        Tone.Transport.cancel();
        Tone.Transport.seconds = time;
        pausedTime = time;

        // 1. 重新创建 activeCodeBlocks
        activeCodeBlocks = [];
        midiEvents.forEach(event => {
            if (event.time >= time) {
                createCodeBlock(event.note, event.time, event.duration || 0.5);
            }
        });

        // 2. 重新 schedule 音符播放
        midiEvents.forEach(event => {
            if (event.time >= time) {
                Tone.Transport.schedule((t) => {
                    playNote(event.note, event.duration || 0.5);
                }, event.time);
            }
        });

        // 3. 启动动画
        animateCodeBlocks();

        updateProgressBar((time / totalDuration) * 100);
        updateCurrentTime(time);

        if (wasPlaying) {
            Tone.Transport.start();
            startProgressUpdates();
            isPlaying = true;
            document.getElementById('play-btn').innerHTML = '<i class="fa fa-pause"></i> 暂停';
        }
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Patch: override fill with data-hover color on MIDI playback
    const originalPlayNote = playNote;
    function playNoteWithVisual(note, duration = '8n') {
        originalPlayNote(note, duration);
        const key = document.querySelector(`rect[data-note="${note}"]`);
        if (key && !key.classList.contains('key-active')) {
            const hover = key.getAttribute('data-hover');
            if (hover) {
                key.style.fill = hover;
            }
        }
    }
    function releaseNoteVisual(note) {
        const key = document.querySelector(`rect[data-note="${note}"]`);
        if (key) {
            key.style.fill = '';
        }
    }
    // 清空所有动态代码块
    function clearCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => block.remove());
    }

    const DISPLAY_HEIGHT = 220;  // 代码块显示区域高度
    const PRE_DROP_TIME = 2.5;   // 代码块从顶部外落下到落底需要的提前时间（秒）
    const MAX_BLOCK_HEIGHT = 50; // 代码块最大高度，和声音持续时间相关

    const FALL_DISTANCE = DISPLAY_HEIGHT + MAX_BLOCK_HEIGHT; // 代码块总移动距离
    const FALL_SPEED = FALL_DISTANCE / PRE_DROP_TIME;        // px/s 均速下落速度

    const MIN_KEY_ACTIVE_DURATION = 0.15; // 120ms，建议80~150ms之间

    // 全局管理所有动态代码块的数组
    let activeCodeBlocks = [];

    // 创建单个动态代码块（音符下落效果）
    function createCodeBlock(note, startTime, duration) {
        const noteDisplay = document.getElementById('note-display');
        const key = document.querySelector(`#piano rect[data-note="${note}"]`);
        if (!key) return;

        const color = key.dataset.hover;
        const width = parseFloat(key.getAttribute('width'));
        const height = Math.max(5, duration * 50);

        // x位置对齐琴键x
        const x = parseFloat(key.getAttribute('x'));

        // 创建代码块SVG矩形
        const codeBlock = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        codeBlock.setAttribute('x', x);
        // 初始y为-高度（显示区顶部外）
        codeBlock.setAttribute('y', -height);
        codeBlock.setAttribute('width', width);
        codeBlock.setAttribute('height', height);
        codeBlock.setAttribute('fill', color);
        codeBlock.setAttribute('class', 'code-block');
        codeBlock.setAttribute('opacity', '0.8');
        codeBlock.setAttribute('rx', '2'); // 更小的圆角
        codeBlock.setAttribute('ry', '2'); // 更小的圆角
        noteDisplay.parentNode.insertBefore(codeBlock, noteDisplay.nextSibling);

        // 计算代码块下落开始的全局时间 = 音符开始时间 startTime - PRE_DROP_TIME
        // 注意：startTime是钢琴曲相对0s的音乐时间

        // 创建管理对象，方便在动画中使用
        const blockObj = {
            note,
            element: codeBlock,
            startTime,     // 音符演奏开始时间
            duration,      // 音符持续时间
            fallStartTime: startTime - PRE_DROP_TIME, // 下落开始时间
            height,
            x,
            isPlaying: false,   // 标记当前是否已播放音符
        };

        activeCodeBlocks.push(blockObj);
    }

    // 全局动画函数，驱动所有代码块下落和播放音符
    function animateCodeBlocks() {
        const currentTime = Tone.Transport.seconds;

        activeCodeBlocks.forEach(block => {
            let elapsed = currentTime - block.fallStartTime;
            if (elapsed < 0) {
                // 还没开始下落，位置保持在顶部外
                block.element.setAttribute('y', -block.height);
                // 关键：未出现时，确保琴键未按下
                if (block.isPlaying) {
                    block.isPlaying = false;
                    releaseKeyActiveVisual(keyElement);
                }
                return;
            }
            // 计算代码块当前y坐标
            let yPos = -block.height + FALL_SPEED * elapsed;
            block.element.setAttribute('y', yPos);

            const blockBottom = yPos + block.height; // 代码块下沿位置

            const keyElement = document.querySelector(`rect[data-note="${block.note}"]`);
            if (!keyElement) return;

            // 只有当代码块下沿进入可见区底部时才按下琴键
            if (!block.isPlaying && blockBottom >= DISPLAY_HEIGHT && yPos < DISPLAY_HEIGHT) {
                block.isPlaying = true;
                block.keyActiveTime = performance.now(); // 记录按下时间
                applyKeyActiveVisual(keyElement);
            }

            // 只有满足两个条件才松开琴键
            // 1. 代码块上沿超过底部
            // 2. 按下时间已超过最小时长
            if (block.isPlaying && yPos >= DISPLAY_HEIGHT) {
                const now = performance.now();
                if (!block.keyActiveTime || now - block.keyActiveTime >= MIN_KEY_ACTIVE_DURATION * 1000) {
                    block.isPlaying = false;
                    releaseKeyActiveVisual(keyElement);
                    activeCodeBlocks = activeCodeBlocks.filter(b => b !== block);
                    block.element.remove();
                }
                // 否则，暂时不松开，等下次动画循环再判断
            }
        });

        // 继续动画循环
        if (activeCodeBlocks.length > 0) {
            requestAnimationFrame(animateCodeBlocks);
        }
    }
    function applyPressedVisual(keyElement) {
        const hoverColor = keyElement.getAttribute('data-hover');
        if (hoverColor) {
            keyElement.style.fill = hoverColor;
        }
    }

    function applyKeyActiveVisual(keyElement) {
        if (!keyElement) return;
        const hoverColor = keyElement.getAttribute('data-hover');
        if (hoverColor) {
            keyElement.style.fill = hoverColor;
        }
        keyElement.classList.add('key-active');
    }

    function releaseKeyActiveVisual(keyElement) {
        if (!keyElement) return;
        keyElement.classList.remove('key-active');
        keyElement.style.fill = '';
    }
    function releasePressedVisual(keyElement) {
        keyElement.style.fill = '';
    }
    function mapNoteName(note) {
        // if (!note) return note;
        // return note.replace(/#/g, 's');
        return note;
    }
});

