// 游戏配置
const config = {
  gridSize: 4,
  startTiles: 2,
  winningValue: 8, // 8代表超级猫，达到这个级别时游戏胜利
};

// 猫咪配置 - 级别越高，猫咪越高级
const catConfig = [
  { value: 1, name: "小猫", image: "https://cataas.com/cat?width=128&height=128&random=1", bgColor: "#FFECEC" },
  { value: 2, name: "中猫", image: "https://cataas.com/cat?width=128&height=128&random=2", bgColor: "#FFE0E0" },
  { value: 3, name: "大猫", image: "https://cataas.com/cat?width=128&height=128&random=3", bgColor: "#FFD0D0" },
  { value: 4, name: "猫主人", image: "https://cataas.com/cat?width=128&height=128&random=4", bgColor: "#FFC0C0" },
  { value: 5, name: "猫管家", image: "https://cataas.com/cat?width=128&height=128&random=5", bgColor: "#FFB0B0" },
  { value: 6, name: "猫博士", image: "https://cataas.com/cat?width=128&height=128&random=6", bgColor: "#FFA0A0" },
  { value: 7, name: "猫教授", image: "https://cataas.com/cat?width=128&height=128&random=7", bgColor: "#FF9090" },
  { value: 8, name: "超级猫", image: "https://cataas.com/cat?width=128&height=128&random=8", bgColor: "#FF8080" },
];

// 猫咪进化称号映射（2~2048）
const catTitles = {
  1: "小小猫",
  2: "可爱猫",
  3: "淘气猫",
  4: "吃货猫",
  5: "霸气猫",
  6: "猫中贵族",
  7: "猫咪大佬",
  8: "猫界精英",
  9: "猫王",
  10: "喵星大帝",
  11: "喵星之主"
};

// 图片缓存，避免重复请求
const catImageCache = {};

// 获取带称号的猫meme图片（Cataas API）
async function getCatMemeUrl(title, value) {
  // 缓存key用value，保证每级唯一
  if (catImageCache[value]) return catImageCache[value];
  try {
    const resp = await fetch(`https://cataas.com/cat/says/${encodeURIComponent(title)}?size=50&json=true`);
    const data = await resp.json();
    const url = "https://cataas.com" + data.url;
    catImageCache[value] = url;
    return url;
  } catch (e) {
    // 失败时用默认猫图
    return "https://cataas.com/cat?width=128&height=128";
  }
}

// 游戏状态
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('cat2048BestScore') || 0;
let gameOver = false;
let gameWon = false;
let canMove = true;

// DOM元素
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const gameWinElement = document.getElementById('game-win');
const winScoreElement = document.getElementById('win-score');
const newGameButton = document.getElementById('new-game');
const playAgainButton = document.getElementById('play-again');
const newGameWinButton = document.getElementById('new-game-win');
const continuePlayingButton = document.getElementById('continue-playing');
const howToPlayButton = document.getElementById('how-to-play');
const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('close-modal');

// 初始化游戏
function initGame() {
  // 清空游戏容器
  while (gameContainer.children.length > 1) {
    gameContainer.removeChild(gameContainer.lastChild);
  }

  // 初始化网格
  grid = [];
  for (let y = 0; y < config.gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < config.gridSize; x++) {
      grid[y][x] = null;
    }
  }

  // 重置游戏状态
  score = 0;
  gameOver = false;
  gameWon = false;
  canMove = true;

  // 更新分数显示
  updateScore();

  // 生成初始方块
  addStartTiles();

  // 隐藏游戏结束和胜利遮罩
  gameOverElement.classList.add('hidden');
  gameWinElement.classList.add('hidden');
}

// 添加初始方块
function addStartTiles() {
  for (let i = 0; i < config.startTiles; i++) {
    addRandomTile();
  }
}

// 添加随机方块
function addRandomTile() {
  if (hasEmptyCells()) {
    // 找到所有空单元格
    const emptyCells = [];
    for (let y = 0; y < config.gridSize; y++) {
      for (let x = 0; x < config.gridSize; x++) {
        if (!grid[y][x]) {
          emptyCells.push({ x, y });
        }
      }
    }

    // 随机选择一个空单元格
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // 90%概率生成小猫(1)，10%概率生成中猫(2)
    const value = Math.random() < 0.9 ? 1 : 2;

    // 在网格中设置方块
    grid[cell.y][cell.x] = { value };

    // 在DOM中创建方块
    renderTile(cell.x, cell.y, value, true);
  }
}

// 渲染方块
function renderTile(x, y, value, isNew = false) {
  const title = catTitles[value] || `猫猫${value}`;
  const cat = catConfig[value - 1] || catConfig[0];
  const tile = document.createElement('div');
  tile.className = `cat-tile ${isNew ? 'tile-appear' : ''}`;
  tile.style.width = `calc((100% - 9px) / 4)`;
  tile.style.height = `calc((100% - 9px) / 4)`;
  tile.style.left = `${x * (100 / config.gridSize)}%`;
  tile.style.top = `${y * (100 / config.gridSize)}%`;
  tile.style.backgroundColor = cat.bgColor;
  tile.innerHTML = `
    <div class="relative w-full h-full">
      <img src="${cat.image}" alt="${title}" class="w-full h-full object-cover rounded-lg">
      <div class="absolute bottom-0 right-0 text-xs font-bold bg-white/80 px-1 rounded">${title}</div>
    </div>
  `;
  tile.dataset.x = x;
  tile.dataset.y = y;
  tile.dataset.value = value;
  gameContainer.appendChild(tile);
}

// 更新方块位置和值
function updateTile(tile, x, y, value, isMerged = false) {
  const title = catTitles[value] || `猫猫${value}`;
  const cat = catConfig[value - 1] || catConfig[0];
  if (isMerged) {
    tile.classList.add('tile-merge');
    setTimeout(() => {
      tile.classList.remove('tile-merge');
    }, 300);
  }
  tile.style.left = `${x * (100 / config.gridSize)}%`;
  tile.style.top = `${y * (100 / config.gridSize)}%`;
  tile.style.backgroundColor = cat.bgColor;
  tile.innerHTML = `
    <div class="relative w-full h-full">
      <img src="${cat.image}" alt="${title}" class="w-full h-full object-cover rounded-lg">
      <div class="absolute bottom-0 right-0 text-xs font-bold bg-white/80 px-1 rounded">${title}</div>
    </div>
  `;
  tile.dataset.x = x;
  tile.dataset.y = y;
  tile.dataset.value = value;
}

// 移动方块
function move(direction) {
  if (!canMove || gameOver || gameWon) return;

  let moved = false;
  canMove = false;

  // 根据方向处理移动逻辑
  switch(direction) {
    case 'up':
      moved = moveUp();
      break;
    case 'down':
      moved = moveDown();
      break;
    case 'left':
      moved = moveLeft();
      break;
    case 'right':
      moved = moveRight();
      break;
  }

  if (moved) {
    // 添加新方块
    setTimeout(() => {
      addRandomTile();

      // 检查游戏状态
      checkGameState();

      canMove = true;
    }, 200);
  } else {
    canMove = true;
  }
}

// 向上移动
function moveUp() {
  let moved = false;

  for (let x = 0; x < config.gridSize; x++) {
    for (let y = 1; y < config.gridSize; y++) {
      if (grid[y][x]) {
        let newY = y;

        // 找到可以移动到的最高位置
        while (newY > 0 && !grid[newY - 1][x]) {
          newY--;
        }

        // 检查是否可以合并
        if (newY > 0 && grid[newY - 1][x] && grid[newY - 1][x].value === grid[y][x].value) {
          // 合并方块
          mergeTiles(x, y, x, newY - 1);
          moved = true;
        } else if (newY !== y) {
          // 移动方块
          moveTile(x, y, x, newY);
          moved = true;
        }
      }
    }
  }

  return moved;
}

// 向下移动
function moveDown() {
  let moved = false;

  for (let x = 0; x < config.gridSize; x++) {
    for (let y = config.gridSize - 2; y >= 0; y--) {
      if (grid[y][x]) {
        let newY = y;

        // 找到可以移动到的最低位置
        while (newY < config.gridSize - 1 && !grid[newY + 1][x]) {
          newY++;
        }

        // 检查是否可以合并
        if (newY < config.gridSize - 1 && grid[newY + 1][x] && grid[newY + 1][x].value === grid[y][x].value) {
          // 合并方块
          mergeTiles(x, y, x, newY + 1);
          moved = true;
        } else if (newY !== y) {
          // 移动方块
          moveTile(x, y, x, newY);
          moved = true;
        }
      }
    }
  }

  return moved;
}

// 向左移动
function moveLeft() {
  let moved = false;

  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 1; x < config.gridSize; x++) {
      if (grid[y][x]) {
        let newX = x;

        // 找到可以移动到的最左位置
        while (newX > 0 && !grid[y][newX - 1]) {
          newX--;
        }

        // 检查是否可以合并
        if (newX > 0 && grid[y][newX - 1] && grid[y][newX - 1].value === grid[y][x].value) {
          // 合并方块
          mergeTiles(x, y, newX - 1, y);
          moved = true;
        } else if (newX !== x) {
          // 移动方块
          moveTile(x, y, newX, y);
          moved = true;
        }
      }
    }
  }

  return moved;
}

// 向右移动
function moveRight() {
  let moved = false;

  for (let y = 0; y < config.gridSize; y++) {
    for (let x = config.gridSize - 2; x >= 0; x--) {
      if (grid[y][x]) {
        let newX = x;

        // 找到可以移动到的最右位置
        while (newX < config.gridSize - 1 && !grid[y][newX + 1]) {
          newX++;
        }

        // 检查是否可以合并
        if (newX < config.gridSize - 1 && grid[y][newX + 1] && grid[y][newX + 1].value === grid[y][x].value) {
          // 合并方块
          mergeTiles(x, y, newX + 1, y);
          moved = true;
        } else if (newX !== x) {
          // 移动方块
          moveTile(x, y, newX, y);
          moved = true;
        }
      }
    }
  }

  return moved;
}

// 移动方块
function moveTile(fromX, fromY, toX, toY) {
  // 更新网格数据
  grid[toY][toX] = grid[fromY][fromX];
  grid[fromY][fromX] = null;

  // 更新DOM
  const tiles = gameContainer.querySelectorAll('.cat-tile');
  for (let tile of tiles) {
    if (parseInt(tile.dataset.x) === fromX && parseInt(tile.dataset.y) === fromY) {
      tile.dataset.x = toX;
      tile.dataset.y = toY;
      tile.style.left = `${toX * (100 / config.gridSize)}%`;
      tile.style.top = `${toY * (100 / config.gridSize)}%`;
      break;
    }
  }
}

// 合并方块
function mergeTiles(fromX, fromY, toX, toY) {
  // 更新分数
  const mergedValue = grid[fromY][fromX].value + 1;
  score += mergedValue;
  updateScore();

  // 更新网格数据
  grid[toY][toX].value = mergedValue;
  grid[fromY][fromX] = null;

  // 更新DOM
  const tiles = gameContainer.querySelectorAll('.cat-tile');
  let merged = false;

  for (let tile of tiles) {
    if (parseInt(tile.dataset.x) === fromX && parseInt(tile.dataset.y) === fromY) {
      // 移除被合并的方块
      gameContainer.removeChild(tile);
    } else if (parseInt(tile.dataset.x) === toX && parseInt(tile.dataset.y) === toY && !merged) {
      // 更新合并后的方块
      updateTile(tile, toX, toY, mergedValue, true);
      merged = true;
    }
  }

  // 检查是否达到胜利条件
  if (mergedValue >= config.winningValue && !gameWon) {
    gameWon = true;
    setTimeout(() => {
      showWinScreen();
    }, 500);
  }
}

// 检查游戏状态
function checkGameState() {
  if (!hasEmptyCells() && !canMoveAny()) {
    gameOver = true;
    showGameOver();
  }
}

// 检查是否有空单元格
function hasEmptyCells() {
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      if (!grid[y][x]) {
        return true;
      }
    }
  }
  return false;
}

// 检查是否还能移动
function canMoveAny() {
  // 检查水平方向
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize - 1; x++) {
      if (grid[y][x] && grid[y][x + 1] && grid[y][x].value === grid[y][x + 1].value) {
        return true;
      }
    }
  }

  // 检查垂直方向
  for (let x = 0; x < config.gridSize; x++) {
    for (let y = 0; y < config.gridSize - 1; y++) {
      if (grid[y][x] && grid[y + 1][x] && grid[y][x].value === grid[y + 1][x].value) {
        return true;
      }
    }
  }

  return false;
}

// 更新分数
function updateScore() {
  scoreElement.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    bestScoreElement.textContent = bestScore;
    localStorage.setItem('cat2048BestScore', bestScore);
  }
}

// 显示游戏结束
function showGameOver() {
  finalScoreElement.textContent = score;
  gameOverElement.classList.remove('hidden');
}

// 显示胜利画面
function showWinScreen() {
  winScoreElement.textContent = score;
  gameWinElement.classList.remove('hidden');
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
  // 初始化游戏
  initGame();

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (gameOver || gameWon) return;

    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move('up');
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        move('down');
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move('left');
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        move('right');
        e.preventDefault();
        break;
    }
  });

  // 触摸控制
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  gameContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });

  gameContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  gameContainer.addEventListener('touchend', (e) => {
    if (gameOver || gameWon) return;

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    // 判断滑动方向
    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平滑动
      if (dx > 20) {
        move('right');
      } else if (dx < -20) {
        move('left');
      }
    } else {
      // 垂直滑动
      if (dy > 20) {
        move('down');
      } else if (dy < -20) {
        move('up');
      }
    }

    e.preventDefault();
  }, { passive: false });

  // 新游戏按钮
  newGameButton.addEventListener('click', initGame);
  playAgainButton.addEventListener('click', initGame);
  newGameWinButton.addEventListener('click', initGame);

  // 继续游戏按钮
  continuePlayingButton.addEventListener('click', () => {
    gameWinElement.classList.add('hidden');
    gameWon = false;
  });

  // 游戏说明
  howToPlayButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // 点击模态框背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});

