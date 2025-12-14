// 节拍器主逻辑
// 获取DOM元素
const bpmInput = document.getElementById('bpm');
const bpmSlider = document.getElementById('bpm-slider');
const bpmValue = document.getElementById('bpm-value');
const beatsPerMeasureInput = document.getElementById('beatsPerMeasure');
const startStopBtn = document.getElementById('startStopBtn');
const statusDisplay = document.getElementById('status-display');
const decreaseBpmBtn = document.getElementById('decrease-bpm');
const increaseBpmBtn = document.getElementById('increase-bpm');
const decreaseBpmMajorBtn = document.getElementById('decrease-bpm-major');
const increaseBpmMajorBtn = document.getElementById('increase-bpm-major');
const speedTerms = document.querySelectorAll('.speed-term');
const beatOptions = document.querySelectorAll('.beat-option');
const beatIndicator = document.getElementById('beat-indicator');
const beatCircle = document.getElementById('beat-circle');
const beatDot = document.getElementById('beat-dot');
const audioPermission = document.getElementById('audio-permission');
const beatNumbers = document.querySelectorAll('.beat-number');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const toggleSpeedTerms = document.getElementById('toggle-speed-terms');
const speedTermsContainer = document.getElementById('speed-terms-container');
const chevronIcon = toggleSpeedTerms.querySelector('i');

// 状态变量
let areSpeedTermsVisible = false; // 默认隐藏速度术语

// 节拍器状态
let audioCtx = null;
let isPlaying = false;
let currentBeat = 0;
let timer = null;
let isAudioUnlocked = false;
let volume = 90; // 默认音量为90%

// 更新BPM显示
function updateBpmDisplay(value) {
  bpmInput.value = value;
  bpmSlider.value = value;
  bpmValue.textContent = value;
  // 更新速度术语按钮状态
  speedTerms.forEach(term => {
    if (parseInt(term.dataset.value) === parseInt(value)) {
      term.classList.add('active');
    } else {
      term.classList.remove('active');
    }
  });
}

// 更新音量显示
function updateVolumeDisplay(value) {
  volume = parseInt(value);
  volumeValue.textContent = value;
  volumeSlider.value = value;
}

// 播放节拍声音
function playClick(accent = false) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  // 根据音量设置调整增益
  const gain = volume / 100;
  gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.type = "sine";
  osc.frequency.value = accent ? 1000 : 600; // 高音是强拍
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
  // 视觉反馈
  beatDot.classList.add('pulse-beat');
  setTimeout(() => beatDot.classList.remove('pulse-beat'), 300);
  // 强拍视觉区分
  if (accent) {
    beatDot.classList.add('bg-yellow-500');
    beatDot.classList.remove('bg-blue-500');
  } else {
    beatDot.classList.remove('bg-yellow-500');
    beatDot.classList.add('bg-blue-500');
  }
}

// 更新节拍显示
function updateBeatDisplay(beat, totalBeats) {
  // 重置所有节拍数显示
  beatNumbers.forEach((num, index) => {
    num.classList.remove('beat-active');
    if (index < totalBeats) {
      num.classList.remove('hidden');
    } else {
      num.classList.add('hidden');
    }
  });
  // 激活当前节拍
  const activeBeat = document.querySelector(`.beat-number[data-beat="${beat}"]`);
  if (activeBeat) {
    activeBeat.classList.add('beat-active');
  }
}

// 初始化音频上下文
function initAudio() {
  if (audioCtx) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // 检查音频上下文状态
    if (audioCtx.state === 'suspended') {
      showAudioPermission();
      return false;
    } else {
      isAudioUnlocked = true;
      return true;
    }
  } catch (error) {
    console.error('音频初始化失败:', error);
    statusDisplay.textContent = '音频初始化失败，请更换浏览器';
    statusDisplay.classList.add('bg-red-50', 'text-red-600');
    return false;
  }
}

// 解锁音频上下文
function unlockAudio() {
  if (!audioCtx) return;
  audioCtx.resume().then(() => {
    isAudioUnlocked = true;
    audioPermission.classList.add('hidden');
    // 如果用户已经点击了开始，立即启动
    if (isPlaying) {
      startMetronome();
    }
  }).catch(error => {
    console.error('音频解锁失败:', error);
    statusDisplay.textContent = '音频授权失败，请重试';
    statusDisplay.classList.add('bg-red-50', 'text-red-600');
  });
}

// 显示音频授权提示
function showAudioPermission() {
  audioPermission.classList.remove('hidden');
  // 点击页面任意位置尝试解锁
  document.addEventListener('click', handleAudioUnlock, { once: true });
}

// 处理音频解锁
function handleAudioUnlock(event) {
  // 避免重复处理开始按钮的点击
  if (event.target !== startStopBtn) {
    unlockAudio();
  }
}

// 开始节拍器
function startMetronome() {
  // 确保音频上下文已初始化
  if (!audioCtx && !initAudio()) return;
  // 检查音频是否已解锁
  if (audioCtx.state === 'suspended') {
    showAudioPermission();
    return;
  }
  const bpm = parseInt(bpmInput.value);
  const beatsPerMeasure = parseInt(beatsPerMeasureInput.value);
  const interval = 60000 / bpm;
  currentBeat = 0;
  isPlaying = true;
  startStopBtn.innerHTML = '<i class="fa fa-stop"></i> 停止';
  startStopBtn.classList.remove('bg-yellow-500');
  startStopBtn.classList.add('bg-red-500');
  // 立即处理第一拍
  setTimeout(() => {
    currentBeat = 1;
    const isAccent = currentBeat === 1;
    playClick(isAccent);
    updateBeatDisplay(currentBeat, beatsPerMeasure);
    statusDisplay.textContent = `拍子：${currentBeat} / ${beatsPerMeasure}`;
  }, 100);
  // 设置定时器
  timer = setInterval(() => {
    currentBeat = (currentBeat % beatsPerMeasure) + 1;
    const isAccent = currentBeat === 1;
    playClick(isAccent);
    updateBeatDisplay(currentBeat, beatsPerMeasure);
    statusDisplay.textContent = `拍子：${currentBeat} / ${beatsPerMeasure}`;
  }, interval);
}

// 停止节拍器
function stopMetronome() {
  clearInterval(timer);
  isPlaying = false;
  currentBeat = 0;
  statusDisplay.textContent = '已停止';
  startStopBtn.innerHTML = '<i class="fa fa-play"></i> 开始';
  startStopBtn.classList.remove('bg-red-500');
  startStopBtn.classList.add('bg-yellow-500');
  // 重置节拍指示器颜色
  beatDot.classList.remove('bg-yellow-500');
  beatDot.classList.add('bg-blue-500');
  // 重置节拍显示
  beatNumbers.forEach(num => {
    num.classList.remove('beat-active');
  });
}

// BPM控制
decreaseBpmBtn.addEventListener('click', () => {
  let current = parseInt(bpmInput.value);
  if (current > 30) {
    updateBpmDisplay(current - 1);
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    }
  }
});

increaseBpmBtn.addEventListener('click', () => {
  let current = parseInt(bpmInput.value);
  if (current < 300) {
    updateBpmDisplay(current + 1);
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    }
  }
});

decreaseBpmMajorBtn.addEventListener('click', () => {
  let current = parseInt(bpmInput.value);
  if (current > 30) {
    const newValue = Math.max(30, current - 10);
    updateBpmDisplay(newValue);
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    }
  }
});

increaseBpmMajorBtn.addEventListener('click', () => {
  let current = parseInt(bpmInput.value);
  if (current < 300) {
    const newValue = Math.min(300, current + 10);
    updateBpmDisplay(newValue);
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    }
  }
});

bpmSlider.addEventListener('input', () => {
  updateBpmDisplay(bpmSlider.value);
  if (isPlaying) {
    clearInterval(timer);
    startMetronome();
  }
});

// 速度术语预设
speedTerms.forEach(term => {
  term.addEventListener('click', () => {
    const value = term.dataset.value;
    updateBpmDisplay(value);
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    }
  });
});

// 拍号选择
beatOptions.forEach(option => {
  option.addEventListener('click', () => {
    const value = option.dataset.value;
    beatsPerMeasureInput.value = value;
    // 更新UI
    beatOptions.forEach(opt => {
      opt.classList.remove('bg-blue-500', 'text-white');
      opt.classList.add('border', 'border-gray-200', 'hover:bg-gray-50');
    });
    option.classList.add('bg-blue-500', 'text-white');
    option.classList.remove('border', 'border-gray-200', 'hover:bg-gray-50');
    // 如果正在播放，重启节拍器
    if (isPlaying) {
      clearInterval(timer);
      startMetronome();
    } else {
      // 如果未播放，更新节拍显示
      updateBeatDisplay(1, parseInt(value));
    }
  });
});

// 音量控制
volumeSlider.addEventListener('input', () => {
  updateVolumeDisplay(volumeSlider.value);
});

// 速度术语折叠/展开控制
toggleSpeedTerms.addEventListener('click', () => {
  areSpeedTermsVisible = !areSpeedTermsVisible;
  if (areSpeedTermsVisible) {
    speedTermsContainer.classList.remove('hidden');
    chevronIcon.classList.remove('rotate-180');
  } else {
    speedTermsContainer.classList.add('hidden');
    chevronIcon.classList.add('rotate-180');
  }
});

// 事件监听器
startStopBtn.addEventListener('click', () => {
  if (!isPlaying) {
    // 确保音频初始化
    if (!audioCtx) initAudio();
    startMetronome();
  } else {
    stopMetronome();
  }
});

// 初始化状态
statusDisplay.textContent = '准备就绪';
updateBeatDisplay(1, 4); // 默认显示4拍
updateBpmDisplay(100);   // 默认BPM为100
updateVolumeDisplay(90); // 默认音量为90%

