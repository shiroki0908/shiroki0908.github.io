// Tailwind 配置
 tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#8B5A2B',
                secondary: '#D2B48C',
                board: '#DEB887',
                black: '#000000',
                white: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        }
    }
}
// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const BOARD_SIZE = 15; // 15x15的棋盘
    const CELL_SIZE = Math.min(window.innerWidth * 0.8 / BOARD_SIZE, window.innerHeight * 0.6 / BOARD_SIZE);
    const PIECE_SIZE = CELL_SIZE * 0.8;
    
    // 游戏状态
    let gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    let currentPlayer = 1; // 1: 黑棋, 2: 白棋
    let gameActive = true;
    let moveHistory = [];
    let gameTime = 0;
    let timerInterval;
    let gameMode = 'pve'; // 默认人机对战
    let aiPlayer = 2; // AI使用白棋
    let aiDifficulty = 'hard'; // AI难度：固定为困难
    
    // DOM元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const statusText = document.getElementById('statusText');
    const currentPlayerEl = document.getElementById('currentPlayer');
    const playerText = document.getElementById('playerText');
    const gameModeEl = document.getElementById('gameMode');
    const moveCountEl = document.getElementById('moveCount');
    const gameTimeEl = document.getElementById('gameTime');
    const restartBtn = document.getElementById('restartBtn');
    const undoBtn = document.getElementById('undoBtn');
    const pvpBtn = document.getElementById('pvpBtn');
    const pveBtn = document.getElementById('pveBtn');

    const winModal = document.getElementById('winModal');
    const winnerText = document.getElementById('winnerText');
    const newGameBtn = document.getElementById('newGameBtn');
    
    // 设置Canvas尺寸
    canvas.width = CELL_SIZE * (BOARD_SIZE - 1);
    canvas.height = CELL_SIZE * (BOARD_SIZE - 1);
    
    // 绘制棋盘
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格线
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            // 水平线
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(canvas.width, i * CELL_SIZE);
            ctx.stroke();
            
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();
        }
        
        // 绘制天元和星位
        const starPoints = [
            {x: 3, y: 3}, {x: 3, y: 11}, {x: 7, y: 7}, 
            {x: 11, y: 3}, {x: 11, y: 11}
        ];
        
        starPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x * CELL_SIZE, point.y * CELL_SIZE, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#8B4513';
            ctx.fill();
        });
        
        // 绘制棋子
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (gameBoard[i][j] !== 0) {
                    drawPiece(i, j, gameBoard[i][j]);
                }
            }
        }
    }
    
    // 绘制棋子
    function drawPiece(row, col, player) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        
        // 棋子阴影
        ctx.beginPath();
        ctx.arc(x, y, PIECE_SIZE / 2 + 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        
        // 棋子本体
        ctx.beginPath();
        ctx.arc(x, y, PIECE_SIZE / 2, 0, Math.PI * 2);
        
        if (player === 1) {
            // 黑棋 - 渐变效果
            const gradient = ctx.createRadialGradient(
                x - PIECE_SIZE / 6, y - PIECE_SIZE / 6, PIECE_SIZE / 10,
                x, y, PIECE_SIZE / 2
            );
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(1, '#000');
            ctx.fillStyle = gradient;
        } else {
            // 白棋 - 渐变效果
            const gradient = ctx.createRadialGradient(
                x - PIECE_SIZE / 6, y - PIECE_SIZE / 6, PIECE_SIZE / 10,
                x, y, PIECE_SIZE / 2
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            ctx.fillStyle = gradient;
        }
        
        ctx.fill();
        
        // 棋子边缘
        ctx.strokeStyle = player === 1 ? '#333' : '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // 检查胜利条件
    function checkWin(row, col, player) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;  // 当前位置已经有一个棋子
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + i * dy;
                const newCol = col + i * dx;
                
                if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
                    break;
                }
                
                if (gameBoard[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - i * dy;
                const newCol = col - i * dx;
                
                if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
                    break;
                }
                
                if (gameBoard[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查平局
    function checkDraw() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (gameBoard[i][j] === 0) {
                    return false; // 还有空位，不是平局
                }
            }
        }
        return true; // 棋盘已满，平局
    }
    
    // 更新游戏状态显示
    function updateGameStatus() {
        if (gameActive) {
            if (gameMode === 'pve' && currentPlayer === aiPlayer) {
                statusText.textContent = `AI思考中...`;
            } else {
                statusText.textContent = `游戏进行中 - ${currentPlayer === 1 ? '黑棋' : '白棋'}回合`;
            }
            currentPlayerEl.className = `w-6 h-6 rounded-full ${currentPlayer === 1 ? 'bg-black' : 'bg-white border border-gray-300'} mr-2 piece-shadow`;
            playerText.textContent = currentPlayer === 1 ? '黑棋' : '白棋';
        }
        gameModeEl.textContent = gameMode === 'pvp' ? '玩家对战' : '人机对战';
        moveCountEl.textContent = moveHistory.length;
    }
    
    // 更新游戏时间
    function updateGameTime() {
        gameTime++;
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toString().padStart(2, '0');
        gameTimeEl.textContent = `${minutes}:${seconds}`;
    }
    
    // 开始计时
    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(updateGameTime, 1000);
    }
    
    // 停止计时
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    // 显示胜利模态框
    function showWinModal(winner) {
        gameActive = false;
        stopTimer();
        
        let winnerTextContent;
        if (gameMode === 'pvp') {
            winnerTextContent = `${winner === 1 ? '黑棋' : '白棋'}获胜!`;
        } else {
            winnerTextContent = winner === aiPlayer ? 'AI获胜!' : '你获胜了!';
        }
        
        winnerText.textContent = winnerTextContent;
        winModal.classList.remove('hidden');
        
        // 添加动画效果
        setTimeout(() => {
            winModal.classList.add('opacity-100');
            winModal.querySelector('div').classList.remove('scale-95');
            winModal.querySelector('div').classList.add('scale-100');
        }, 10);
    }
    
    // 隐藏胜利模态框
    function hideWinModal() {
        winModal.classList.remove('opacity-100');
        winModal.querySelector('div').classList.remove('scale-100');
        winModal.querySelector('div').classList.add('scale-95');
        
        setTimeout(() => {
            winModal.classList.add('hidden');
        }, 300);
    }
    
    // 重置游戏
    function resetGame() {
        gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        currentPlayer = 1;
        gameActive = true;
        moveHistory = [];
        gameTime = 0;
        
        drawBoard();
        updateGameStatus();
        gameTimeEl.textContent = '00:00';
        
        stopTimer();
        startTimer();
        
        hideWinModal();
    }
    
    // 悔棋
    function undoMove() {
        if (moveHistory.length === 0 || !gameActive) {
            return;
        }
        
        // 在人机模式下，需要撤销两步（玩家和AI各一步）
        const stepsToUndo = gameMode === 'pve' ? 2 : 1;
        
        for (let i = 0; i < stepsToUndo; i++) {
            if (moveHistory.length === 0) break;
            
            const lastMove = moveHistory.pop();
            gameBoard[lastMove.row][lastMove.col] = 0;
            currentPlayer = lastMove.player; // 回到上一个玩家
        }
        
        drawBoard();
        updateGameStatus();
    }
    
    // 智能AI算法 - 使用Alpha-Beta剪枝和更深的搜索
    class SmartAI {
        constructor(board, player, difficulty = 'medium') {
            this.board = board;
            this.player = player;
            this.opponent = player === 1 ? 2 : 1;
            this.difficulty = difficulty;
            this.boardSize = board.length;
            this.maxSearchTime = 3000; // 最大搜索时间3秒
            this.searchStartTime = 0;
            
            // 根据难度设置搜索深度，降低深度避免崩溃
            switch (difficulty) {
                case 'easy':
                    this.maxDepth = 2;
                    break;
                case 'medium':
                    this.maxDepth = 3;
                    break;
                case 'hard':
                    this.maxDepth = 4;
                    break;
                default:
                    this.maxDepth = 3;
            }
        }
        
        // 获取所有可能的落子位置
        getValidMoves() {
            const moves = [];
            const visited = new Set();
            
            // 首先检查已有棋子周围的空位，减少搜索范围
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] !== 0) {
                        // 检查周围4个方向，减少搜索范围
                        for (let di = -1; di <= 1; di++) {
                            for (let dj = -1; dj <= 1; dj++) {
                                if (di === 0 && dj === 0) continue;
                                
                                const ni = i + di;
                                const nj = j + dj;
                                
                                if (ni >= 0 && ni < this.boardSize && 
                                    nj >= 0 && nj < this.boardSize && 
                                    this.board[ni][nj] === 0) {
                                    const key = `${ni},${nj}`;
                                    if (!visited.has(key)) {
                                        moves.push({row: ni, col: nj});
                                        visited.add(key);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // 如果棋盘为空，返回中心位置
            if (moves.length === 0) {
                const center = Math.floor(this.boardSize / 2);
                moves.push({row: center, col: center});
            }
            
            // 限制搜索位置数量，避免计算量过大
            if (moves.length > 20) {
                // 优先选择威胁位置和中心位置
                const center = Math.floor(this.boardSize / 2);
                const centerMoves = moves.filter(move => 
                    Math.abs(move.row - center) <= 2 && Math.abs(move.col - center) <= 2
                );
                
                if (centerMoves.length > 0) {
                    return centerMoves.slice(0, 15);
                } else {
                    return moves.slice(0, 15);
                }
            }
            
            return moves;
        }
        
        // 检查是否获胜
        checkWin(row, col, player) {
            const directions = [
                [1, 0],   // 水平
                [0, 1],   // 垂直
                [1, 1],   // 对角线
                [1, -1]   // 反对角线
            ];
            
            for (const [dx, dy] of directions) {
                let count = 1;
                
                // 正向检查
                for (let i = 1; i < 5; i++) {
                    const newRow = row + i * dy;
                    const newCol = col + i * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize || 
                        this.board[newRow][newCol] !== player) {
                        break;
                    }
                    count++;
                }
                
                // 反向检查
                for (let i = 1; i < 5; i++) {
                    const newRow = row - i * dy;
                    const newCol = col - i * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize || 
                        this.board[newRow][newCol] !== player) {
                        break;
                    }
                    count++;
                }
                
                if (count >= 5) return true;
            }
            return false;
        }
        
        // 评估单个方向的连子情况
        evaluateDirection(row, col, dx, dy, player) {
            let count = 0;
            let blocked = 0;
            let space = 0;
            
            // 正向检查
            for (let i = 0; i < 5; i++) {
                const newRow = row + i * dy;
                const newCol = col + i * dx;
                
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) {
                    blocked++;
                    break;
                }
                
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else if (this.board[newRow][newCol] === 0) {
                    space++;
                    break;
                } else {
                    blocked++;
                    break;
                }
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - i * dy;
                const newCol = col - i * dx;
                
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) {
                    blocked++;
                    break;
                }
                
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else if (this.board[newRow][newCol] === 0) {
                    space++;
                    break;
                } else {
                    blocked++;
                    break;
                }
            }
            
            return { count, blocked, space };
        }
        
        // 评估位置分数
        evaluatePosition(row, col, player) {
            if (this.board[row][col] !== 0) return 0;
            
            const directions = [
                [1, 0],   // 水平
                [0, 1],   // 垂直
                [1, 1],   // 对角线
                [1, -1]   // 反对角线
            ];
            
            let totalScore = 0;
            
            for (const [dx, dy] of directions) {
                const result = this.evaluateDirection(row, col, dx, dy, player);
                const { count, blocked, space } = result;
                
                // 评分规则
                if (count >= 5) {
                    totalScore += 100000; // 五连
                } else if (count === 4) {
                    if (blocked === 0) {
                        totalScore += 10000; // 活四
                    } else if (blocked === 1) {
                        totalScore += 1000; // 冲四
                    }
                } else if (count === 3) {
                    if (blocked === 0) {
                        totalScore += 1000; // 活三
                    } else if (blocked === 1) {
                        totalScore += 100; // 冲三
                    }
                } else if (count === 2) {
                    if (blocked === 0) {
                        totalScore += 100; // 活二
                    } else if (blocked === 1) {
                        totalScore += 10; // 冲二
                    }
                } else if (count === 1) {
                    if (blocked === 0) {
                        totalScore += 10; // 活一
                    }
                }
            }
            
            return totalScore;
        }
        
        // 评估整个棋盘
        evaluateBoard() {
            let aiScore = 0;
            let playerScore = 0;
            
            // 评估AI的得分
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        aiScore += this.evaluatePosition(i, j, this.player);
                        playerScore += this.evaluatePosition(i, j, this.opponent);
                    }
                }
            }
            
            // 检查已有棋子的连子情况
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === this.player) {
                        aiScore += this.evaluateExistingPosition(i, j, this.player);
                    } else if (this.board[i][j] === this.opponent) {
                        playerScore += this.evaluateExistingPosition(i, j, this.opponent);
                    }
                }
            }
            
            // 特别检查四子连线威胁
            const aiFourThreats = this.countFourThreats(this.player);
            const playerFourThreats = this.countFourThreats(this.opponent);
            
            aiScore += aiFourThreats * 5000; // AI的四子连线威胁
            playerScore += playerFourThreats * 6000; // 对手的四子连线威胁，更重视防守
            
            // 特别检查活三威胁
            const aiLiveThreeThreats = this.detectLiveThreePatterns(this.player);
            const playerLiveThreeThreats = this.detectLiveThreePatterns(this.opponent);
            
            aiScore += aiLiveThreeThreats.length * 2000; // AI的活三威胁
            playerScore += playerLiveThreeThreats.length * 2500; // 对手的活三威胁，更重视防守
            
            // 特别检查复杂威胁组合
            const complexThreats = this.analyzeComplexThreats();
            const playerComplexThreats = complexThreats.filter(t => t.type.includes('double') || t.type.includes('plus'));
            
            aiScore += complexThreats.length * 8000; // AI的复杂威胁
            playerScore += playerComplexThreats.length * 10000; // 对手的复杂威胁，极高权重
            
            return aiScore - playerScore * 1.5; // AI更重视防守，特别是复杂威胁
        }
        
        // 计算四子连线威胁数量
        countFourThreats(player) {
            let threatCount = 0;
            
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = player;
                        if (this.hasFourInLine(i, j, player)) {
                            threatCount++;
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return threatCount;
        }
        
        // 评估已有棋子的位置
        evaluateExistingPosition(row, col, player) {
            const directions = [
                [1, 0], [0, 1], [1, 1], [1, -1]
            ];
            
            let totalScore = 0;
            
            for (const [dx, dy] of directions) {
                const result = this.evaluateDirection(row, col, dx, dy, player);
                const { count, blocked } = result;
                
                if (count >= 5) {
                    totalScore += 100000;
                } else if (count === 4) {
                    if (blocked === 0) {
                        totalScore += 10000;
                    } else if (blocked === 1) {
                        totalScore += 1000;
                    }
                } else if (count === 3) {
                    if (blocked === 0) {
                        totalScore += 1000;
                    } else if (blocked === 1) {
                        totalScore += 100;
                    }
                } else if (count === 2) {
                    if (blocked === 0) {
                        totalScore += 100;
                    } else if (blocked === 1) {
                        totalScore += 10;
                    }
                }
            }
            
            return totalScore;
        }
        
        // Alpha-Beta剪枝搜索
        alphaBeta(depth, alpha, beta, isMaximizing) {
            // 检查搜索时间，防止超时
            if (Date.now() - this.searchStartTime > this.maxSearchTime) {
                return 0; // 超时返回中性值
            }
            
            if (depth === 0) {
                return this.evaluateBoard();
            }
            
            const moves = this.getValidMoves();
            
            // 限制搜索的移动数量
            const limitedMoves = moves.slice(0, 10);
            
            if (isMaximizing) {
                let maxEval = -Infinity;
                for (const move of limitedMoves) {
                    // 模拟落子
                    this.board[move.row][move.col] = this.player;
                    
                    // 检查是否获胜
                    if (this.checkWin(move.row, move.col, this.player)) {
                        this.board[move.row][move.col] = 0; // 撤销
                        return 1000000; // 获胜
                    }
                    
                    const evaluation = this.alphaBeta(depth - 1, alpha, beta, false);
                    this.board[move.row][move.col] = 0; // 撤销
                    
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break; // Beta剪枝
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (const move of limitedMoves) {
                    // 模拟落子
                    this.board[move.row][move.col] = this.opponent;
                    
                    // 检查是否获胜
                    if (this.checkWin(move.row, move.col, this.opponent)) {
                        this.board[move.row][move.col] = 0; // 撤销
                        return -1000000; // 对手获胜
                    }
                    
                    const evaluation = this.alphaBeta(depth - 1, alpha, beta, true);
                    this.board[move.row][move.col] = 0; // 撤销
                    
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break; // Alpha剪枝
                }
                return minEval;
            }
        }
        
        // 获取最佳落子位置 - 增强进攻版
        getBestMove() {
            this.searchStartTime = Date.now(); // 开始计时
            
            // 1. 检查AI是否有直接获胜机会（最高优先级）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.player;
                        if (this.checkWin(i, j, this.player)) {
                            this.board[i][j] = 0;
                            console.log('AI发现获胜机会:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 2. 检查对手是否有直接获胜机会（防守）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        if (this.checkWin(i, j, this.opponent)) {
                            this.board[i][j] = 0;
                            console.log('AI防守获胜威胁:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 3. 检查AI是否有四子连线威胁（主动进攻）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.player;
                        if (this.hasFourInLine(i, j, this.player)) {
                            this.board[i][j] = 0;
                            console.log('AI形成四子连线威胁:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 4. 检查对手是否有四子连线威胁（防守）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        if (this.hasFourInLine(i, j, this.opponent)) {
                            this.board[i][j] = 0;
                            console.log('AI防守四子连线威胁:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 5. 检查AI是否有活三威胁（主动进攻）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.player;
                        if (this.hasLiveThreePattern(i, j, this.player)) {
                            this.board[i][j] = 0;
                            console.log('AI形成活三威胁:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 6. 检查对手是否有活三威胁（防守）
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        if (this.hasLiveThreePattern(i, j, this.opponent)) {
                            this.board[i][j] = 0;
                            console.log('AI防守活三威胁:', {row: i, col: j});
                            return {row: i, col: j};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 7. 检查其他紧急防守需求
            const emergencyDefense = this.needsEmergencyDefense();
            if (emergencyDefense) {
                console.log('AI执行紧急防守:', emergencyDefense.type);
                return {row: emergencyDefense.row, col: emergencyDefense.col};
            }
            
            // 8. 主动寻找连接机会（增强进攻意识）
            const connectionMoves = this.findConnectionMoves();
            if (connectionMoves.length > 0) {
                const bestConnection = connectionMoves[0];
                console.log('AI选择连接位置:', bestConnection);
                return bestConnection;
            }
            
            // 9. 传统Alpha-Beta搜索
            const moves = this.getValidMoves();
            let bestMove = null;
            let bestScore = -Infinity;
            const alpha = -Infinity;
            const beta = Infinity;
            
            // 根据游戏阶段调整搜索深度
            const moveCount = this.board.flat().filter(cell => cell !== 0).length;
            let searchDepth = Math.min(this.maxDepth, 3);
            
            if (moveCount < 4) {
                searchDepth = Math.min(2, this.maxDepth); // 开局阶段
            } else if (moveCount < 10) {
                searchDepth = Math.min(3, this.maxDepth); // 中局阶段
            } else {
                searchDepth = Math.min(4, this.maxDepth); // 残局阶段
            }
            
            // 威胁空间分析
            const threatMoves = this.analyzeThreats();
            
            // 优先搜索威胁位置
            if (threatMoves.length > 0) {
                const limitedThreatMoves = threatMoves.slice(0, 5);
                
                for (const move of limitedThreatMoves) {
                    if (Date.now() - this.searchStartTime > this.maxSearchTime) {
                        break;
                    }
                    
                    this.board[move.row][move.col] = this.player;
                    
                    if (this.checkWin(move.row, move.col, this.player)) {
                        this.board[move.row][move.col] = 0;
                        console.log('AI发现获胜机会');
                        return move;
                    }
                    
                    const score = this.alphaBeta(searchDepth - 1, alpha, beta, false);
                    this.board[move.row][move.col] = 0;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = move;
                    }
                }
                
                if (bestMove) {
                    console.log('AI选择威胁位置，评分:', bestScore);
                    return bestMove;
                }
            }
            
            // 搜索其他位置
            const sortedMoves = [...threatMoves, ...moves.filter(move => 
                !threatMoves.some(tm => tm.row === move.row && tm.col === move.col)
            )];
            
            const limitedMoves = sortedMoves.slice(0, 8);
            
            for (const move of limitedMoves) {
                if (Date.now() - this.searchStartTime > this.maxSearchTime) {
                    break;
                }
                
                this.board[move.row][move.col] = this.player;
                
                if (this.checkWin(move.row, move.col, this.player)) {
                    this.board[move.row][move.col] = 0;
                    console.log('AI发现获胜机会');
                    return move;
                }
                
                const score = this.alphaBeta(searchDepth - 1, alpha, beta, false);
                this.board[move.row][move.col] = 0;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            if (bestMove) {
                console.log('AI选择传统搜索位置，评分:', bestScore);
            } else {
                // 如果没有找到最佳移动，随机选择一个位置
                const emptyPositions = [];
                for (let i = 0; i < this.boardSize; i++) {
                    for (let j = 0; j < this.boardSize; j++) {
                        if (this.board[i][j] === 0) {
                            emptyPositions.push({row: i, col: j});
                        }
                    }
                }
                
                if (emptyPositions.length > 0) {
                    bestMove = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                    console.log('AI随机选择位置:', bestMove);
                }
            }
            
            return bestMove;
        }
        
        // 威胁空间分析
        analyzeThreats() {
            const threats = [];
            
            // 首先检查复杂威胁组合（最高优先级）
            const complexThreats = this.analyzeComplexThreats();
            threats.push(...complexThreats);
            
            // 全面威胁分析
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        // 检查AI在此位置是否能直接获胜
                        this.board[i][j] = this.player;
                        if (this.checkWin(i, j, this.player)) {
                            threats.push({row: i, col: j, type: 'win', priority: 1000});
                        }
                        this.board[i][j] = 0;
                        
                        // 检查对手在此位置是否能直接获胜（防守）
                        this.board[i][j] = this.opponent;
                        if (this.checkWin(i, j, this.opponent)) {
                            threats.push({row: i, col: j, type: 'block', priority: 999});
                        }
                        this.board[i][j] = 0;
                        
                        // 检查对手的四子连线威胁（活四）
                        this.board[i][j] = this.opponent;
                        if (this.hasFourInLine(i, j, this.opponent)) {
                            threats.push({row: i, col: j, type: 'block_four', priority: 998});
                        }
                        this.board[i][j] = 0;
                        
                        // 检查AI的四子连线威胁
                        this.board[i][j] = this.player;
                        if (this.hasFourInLine(i, j, this.player)) {
                            threats.push({row: i, col: j, type: 'threat_four', priority: 997});
                        }
                        this.board[i][j] = 0;
                        
                        // 检查对手的活三威胁（2+空+1模式等）
                        this.board[i][j] = this.opponent;
                        if (this.hasLiveThreePattern(i, j, this.opponent)) {
                            threats.push({row: i, col: j, type: 'block_live_three', priority: 996});
                        }
                        this.board[i][j] = 0;
                        
                        // 检查AI的活三威胁
                        this.board[i][j] = this.player;
                        if (this.hasLiveThreePattern(i, j, this.player)) {
                            threats.push({row: i, col: j, type: 'threat_live_three', priority: 995});
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 按优先级排序
            threats.sort((a, b) => b.priority - a.priority);
            
            // 返回去重的位置
            const uniqueThreats = [];
            const seen = new Set();
            for (const threat of threats) {
                const key = `${threat.row},${threat.col}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueThreats.push({row: threat.row, col: threat.col});
                }
            }
            
            return uniqueThreats;
        }
        
        // 检查是否有四子连线
        hasFourInLine(row, col, player) {
            const directions = [
                [1, 0],   // 水平
                [0, 1],   // 垂直
                [1, 1],   // 对角线
                [1, -1]   // 反对角线
            ];
            
            for (const [dx, dy] of directions) {
                let count = 1;  // 当前位置已经有一个棋子
                
                // 正向检查
                for (let i = 1; i < 5; i++) {
                    const newRow = row + i * dy;
                    const newCol = col + i * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize || 
                        this.board[newRow][newCol] !== player) {
                        break;
                    }
                    count++;
                }
                
                // 反向检查
                for (let i = 1; i < 5; i++) {
                    const newRow = row - i * dy;
                    const newCol = col - i * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize || 
                        this.board[newRow][newCol] !== player) {
                        break;
                    }
                    count++;
                }
                
                if (count >= 4) {
                    return true;
                }
            }
            
            return false;
        }
        
        // 检查是否需要紧急防守
        needsEmergencyDefense() {
            // 检查对手是否有直接获胜的机会
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        if (this.checkWin(i, j, this.opponent)) {
                            this.board[i][j] = 0;
                            return {row: i, col: j, type: 'win'};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 检查对手是否有四子连线威胁
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        if (this.hasFourInLine(i, j, this.opponent)) {
                            this.board[i][j] = 0;
                            return {row: i, col: j, type: 'four'};
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            // 检查对手是否有双活三威胁（致命威胁）
            const doubleLiveThreeThreat = this.findDoubleLiveThreeThreat();
            if (doubleLiveThreeThreat) {
                return doubleLiveThreeThreat;
            }
            
            // 检查对手是否有活三威胁（2+空+1模式等）
            const liveThreeThreats = this.findLiveThreeThreats(this.opponent);
            if (liveThreeThreats.length > 0) {
                return {row: liveThreeThreats[0].row, col: liveThreeThreats[0].col, type: 'live_three'};
            }
            
            return null;
        }
        
        // 查找双活三威胁
        findDoubleLiveThreeThreat() {
            // 检查对手在任意位置落子后是否形成双活三
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        
                        // 检查是否形成双活三
                        const liveThreeCount = this.countLiveThreeThreats(this.opponent);
                        if (liveThreeCount >= 2) {
                            this.board[i][j] = 0;
                            return {row: i, col: j, type: 'double_live_three'};
                        }
                        
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return null;
        }
        
        // 计算活三威胁数量
        countLiveThreeThreats(player) {
            let count = 0;
            
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = player;
                        if (this.hasLiveThreePattern(i, j, player)) {
                            count++;
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return count;
        }
        
        // 查找活三威胁
        findLiveThreeThreats(player) {
            const threats = [];
            
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = player;
                        if (this.hasLiveThreePattern(i, j, player)) {
                            threats.push({row: i, col: j});
                        }
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return threats;
        }
        
        // 分析复杂威胁组合
        analyzeComplexThreats() {
            const threats = [];
            
            // 检查对手的复杂威胁
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = this.opponent;
                        
                        // 检查是否形成双活三
                        const liveThreeCount = this.countLiveThreeThreats(this.opponent);
                        if (liveThreeCount >= 2) {
                            threats.push({row: i, col: j, type: 'double_live_three', priority: 1001});
                        }
                        // 检查是否形成活三+四子连线组合
                        else if (liveThreeCount >= 1 && this.hasFourInLine(i, j, this.opponent)) {
                            threats.push({row: i, col: j, type: 'live_three_plus_four', priority: 1002});
                        }
                        // 检查是否形成多个四子连线
                        else if (this.countFourThreats(this.opponent) >= 2) {
                            threats.push({row: i, col: j, type: 'double_four', priority: 1003});
                        }
                        
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return threats;
        }
        
        // 检查是否是活三
        isLiveThree(row, col, player) {
            const directions = [
                [1, 0],   // 水平
                [0, 1],   // 垂直
                [1, 1],   // 对角线
                [1, -1]   // 反对角线
            ];
            
            for (const [dx, dy] of directions) {
                if (this.checkLiveThreeInDirection(row, col, dx, dy, player)) {
                    return true;
                }
            }
            
            return false;
        }
        
        // 检查某个方向是否有活三
        checkLiveThreeInDirection(row, col, dx, dy, player) {
            // 检查各种活三模式
            const patterns = [
                // 模式1: X_X_X (2+空+1)
                [[0, 0], [1, 1], [2, 2], [3, 3]],
                // 模式2: X_XX_ (1+空+2)
                [[0, 0], [1, 1], [2, 2], [3, 3]],
                // 模式3: XX_X_ (2+空+1)
                [[0, 0], [1, 1], [2, 2], [3, 3]],
                // 模式4: _X_XX (1+空+2)
                [[0, 0], [1, 1], [2, 2], [3, 3]]
            ];
            
            for (const pattern of patterns) {
                if (this.matchesPattern(row, col, dx, dy, player, pattern)) {
                    return true;
                }
            }
            
            return false;
        }
        
        // 检查是否匹配特定模式
        matchesPattern(row, col, dx, dy, player, pattern) {
            for (let i = 0; i < 5; i++) {
                const newRow = row + (i - 2) * dy;
                const newCol = col + (i - 2) * dx;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize) {
                    return false;
                }
                
                const expected = pattern[i];
                const actual = this.board[newRow][newCol];
                
                if (expected === 1 && actual !== player) return false;
                if (expected === 0 && actual !== 0) return false;
            }
            
            return true;
        }
        
        // 改进的活三检测 - 更精确的模式匹配
        detectLiveThreePatterns(player) {
            const threats = [];
            
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        this.board[i][j] = player;
                        
                        // 检查各种活三模式
                        if (this.hasLiveThreePattern(i, j, player)) {
                            threats.push({row: i, col: j, type: 'live_three'});
                        }
                        
                        this.board[i][j] = 0;
                    }
                }
            }
            
            return threats;
        }
        
        // 检查是否有活三模式
        hasLiveThreePattern(row, col, player) {
            const directions = [
                [1, 0],   // 水平
                [0, 1],   // 垂直
                [1, 1],   // 对角线
                [1, -1]   // 反对角线
            ];
            
            for (const [dx, dy] of directions) {
                // 检查5个位置的模式
                const positions = [];
                for (let i = -2; i <= 2; i++) {
                    const newRow = row + i * dy;
                    const newCol = col + i * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize) {
                        positions.push(-1); // 边界外
                    } else {
                        positions.push(this.board[newRow][newCol]);
                    }
                }
                
                // 检查活三模式
                if (this.isLiveThreePattern(positions, player)) {
                    return true;
                }
            }
            
            return false;
        }
        
        // 判断是否是活三模式
        isLiveThreePattern(positions, player) {
            // 模式1: 2+空+1 (X_X_X)
            if (positions[0] === player && positions[1] === 0 && 
                positions[2] === player && positions[3] === 0 && 
                positions[4] === player) {
                return true;
            }
            
            // 模式2: 1+空+2 (X_XX_)
            if (positions[0] === player && positions[1] === 0 && 
                positions[2] === player && positions[3] === player && 
                positions[4] === 0) {
                return true;
            }
            
            // 模式3: 2+空+1 (XX_X_)
            if (positions[0] === player && positions[1] === player && 
                positions[2] === 0 && positions[3] === player && 
                positions[4] === 0) {
                return true;
            }
            
            // 模式4: 1+空+2 (_X_XX)
            if (positions[0] === 0 && positions[1] === player && 
                positions[2] === 0 && positions[3] === player && 
                positions[4] === player) {
                return true;
            }
            
            // 模式5: 1+空+1+空+1 (X_X_X)
            if (positions[0] === player && positions[1] === 0 && 
                positions[2] === player && positions[3] === 0 && 
                positions[4] === player) {
                return true;
            }
            
            return false;
        }
        
        // 获取威胁等级
        getThreatLevel(row, col, player) {
            const directions = [
                [1, 0], [0, 1], [1, 1], [1, -1]
            ];
            
            let maxThreat = 0;
            
            for (const [dx, dy] of directions) {
                const result = this.evaluateDirection(row, col, dx, dy, player);
                const { count, blocked } = result;
                
                if (count === 4 && blocked === 0) {
                    maxThreat = Math.max(maxThreat, 100); // 活四
                } else if (count === 4 && blocked === 1) {
                    maxThreat = Math.max(maxThreat, 50); // 冲四
                } else if (count === 3 && blocked === 0) {
                    maxThreat = Math.max(maxThreat, 30); // 活三
                } else if (count === 3 && blocked === 1) {
                    maxThreat = Math.max(maxThreat, 15); // 冲三
                } else if (count === 2 && blocked === 0) {
                    maxThreat = Math.max(maxThreat, 5); // 活二
                }
            }
            
            return maxThreat;
        }
        
        // 智能开局策略
        getOpeningMove() {
            const center = Math.floor(this.boardSize / 2);
            const moveCount = this.board.flat().filter(cell => cell !== 0).length;
            
            if (moveCount === 0) {
                // 第一步：选择中心位置
                return {row: center, col: center};
            } else if (moveCount === 1) {
                // 第二步：选择中心附近的有利位置
                const centerPositions = [
                    {row: center-1, col: center-1}, {row: center-1, col: center}, {row: center-1, col: center+1},
                    {row: center, col: center-1}, {row: center, col: center+1},
                    {row: center+1, col: center-1}, {row: center+1, col: center}, {row: center+1, col: center+1}
                ];
                
                for (const pos of centerPositions) {
                    if (pos.row >= 0 && pos.row < this.boardSize && 
                        pos.col >= 0 && pos.col < this.boardSize && 
                        this.board[pos.row][pos.col] === 0) {
                        return pos;
                    }
                }
            }
            
            return null; // 不是开局阶段
        }
        
        // 评估局势复杂度
        evaluateComplexity() {
            let complexity = 0;
            
            // 计算活跃棋子数量
            const activePieces = this.board.flat().filter(cell => cell !== 0).length;
            complexity += activePieces * 2;
            
            // 计算威胁数量
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] !== 0) {
                        const threatLevel = this.getThreatLevel(i, j, this.board[i][j]);
                        complexity += threatLevel;
                    }
                }
            }
            
            return complexity;
        }
        
        // 寻找连接机会（增强进攻意识）
        findConnectionMoves() {
            const connectionMoves = [];
            
            for (let i = 0; i < this.boardSize; i++) {
                for (let j = 0; j < this.boardSize; j++) {
                    if (this.board[i][j] === 0) {
                        const connectionScore = this.evaluateConnectionScore(i, j, this.player);
                        if (connectionScore > 100) { // 只考虑有意义的连接
                            connectionMoves.push({
                                row: i,
                                col: j,
                                score: connectionScore
                            });
                        }
                    }
                }
            }
            
            // 按连接分数排序
            connectionMoves.sort((a, b) => b.score - a.score);
            return connectionMoves;
        }
        
        // 评估连接分数
        evaluateConnectionScore(row, col, player) {
            let score = 0;
            const directions = [
                [1, 0], [0, 1], [1, 1], [1, -1]
            ];
            
            for (const [dx, dy] of directions) {
                let connectedPieces = 0;
                let emptySpaces = 0;
                let blocked = 0;
                
                // 正向检查
                for (let k = 1; k <= 4; k++) {
                    const newRow = row + k * dy;
                    const newCol = col + k * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize) {
                        blocked++;
                        break;
                    }
                    
                    if (this.board[newRow][newCol] === player) {
                        connectedPieces++;
                    } else if (this.board[newRow][newCol] === 0) {
                        emptySpaces++;
                        break;
                    } else {
                        blocked++;
                        break;
                    }
                }
                
                // 反向检查
                for (let k = 1; k <= 4; k++) {
                    const newRow = row - k * dy;
                    const newCol = col - k * dx;
                    
                    if (newRow < 0 || newRow >= this.boardSize || 
                        newCol < 0 || newCol >= this.boardSize) {
                        blocked++;
                        break;
                    }
                    
                    if (this.board[newRow][newCol] === player) {
                        connectedPieces++;
                    } else if (this.board[newRow][newCol] === 0) {
                        emptySpaces++;
                        break;
                    } else {
                        blocked++;
                        break;
                    }
                }
                
                // 根据连接情况评分
                if (connectedPieces >= 2) {
                    score += 500; // 连接多个棋子
                } else if (connectedPieces === 1) {
                    score += 200; // 连接一个棋子
                }
                
                // 根据空位情况评分
                if (emptySpaces >= 3) {
                    score += 300; // 有发展空间
                } else if (emptySpaces >= 2) {
                    score += 150;
                }
                
                // 根据阻塞情况评分
                if (blocked === 0) {
                    score += 100; // 完全开放
                } else if (blocked === 1) {
                    score += 50; // 部分开放
                }
            }
            
            return score;
        }
    }
    
    // 测试斜对角线检测
    function testDiagonalDetection() {
        console.log('=== 测试斜对角线检测 ===');
        
        // 创建一个测试棋盘
        const testBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        
        // 创建一个斜对角线五子连线
        testBoard[0][0] = 1;
        testBoard[1][1] = 1;
        testBoard[2][2] = 1;
        testBoard[3][3] = 1;
        testBoard[4][4] = 1;
        
        console.log('测试棋盘:');
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row = '';
            for (let j = 0; j < BOARD_SIZE; j++) {
                row += testBoard[i][j] + ' ';
            }
            console.log(row);
        }
        
        // 测试主游戏的checkWin函数
        const mainGameWin = checkWin(2, 2, 1);
        console.log('主游戏checkWin检测结果:', mainGameWin);
        
        // 测试AI的checkWin函数
        const ai = new SmartAI(testBoard, 1);
        const aiWin = ai.checkWin(2, 2, 1);
        console.log('AI checkWin检测结果:', aiWin);
        
        // 测试AI的hasFourInLine函数
        const fourInLine = ai.hasFourInLine(2, 2, 1);
        console.log('AI hasFourInLine检测结果:', fourInLine);
        
        console.log('=== 测试完成 ===');
    }
    
    // 测试活三威胁检测
    function testLiveThreeDetection() {
        console.log('=== 测试活三威胁检测 ===');
        
        // 创建一个测试棋盘
        const testBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        
        // 创建2+空+1模式（活三威胁）
        testBoard[7][7] = 2; // 对手棋子
        testBoard[7][8] = 2; // 对手棋子
        testBoard[7][9] = 0; // 空位
        testBoard[7][10] = 2; // 对手棋子
        
        console.log('活三威胁测试棋盘:');
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row = '';
            for (let j = 0; j < BOARD_SIZE; j++) {
                row += testBoard[i][j] + ' ';
            }
            console.log(row);
        }
        
        // 测试AI的活三检测
        const ai = new SmartAI(testBoard, 1);
        
        // 检查AI是否能检测到活三威胁
        const liveThreeThreats = ai.detectLiveThreePatterns(2); // 检查对手的活三威胁
        console.log('AI检测到的活三威胁数量:', liveThreeThreats.length);
        
        if (liveThreeThreats.length > 0) {
            console.log('活三威胁位置:', liveThreeThreats);
        }
        
        // 测试紧急防守检测
        const emergencyDefense = ai.needsEmergencyDefense();
        console.log('紧急防守检测结果:', emergencyDefense);
        
        console.log('=== 活三威胁测试完成 ===');
    }
    
    // 测试双活三威胁检测
    function testDoubleLiveThreeDetection() {
        console.log('=== 测试双活三威胁检测 ===');
        
        // 创建一个测试棋盘
        const testBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        
        // 创建双活三威胁场景
        // 第一个活三：水平方向
        testBoard[7][7] = 2; // 对手棋子
        testBoard[7][8] = 2; // 对手棋子
        testBoard[7][9] = 0; // 空位
        testBoard[7][10] = 2; // 对手棋子
        
        // 第二个活三：垂直方向
        testBoard[5][5] = 2; // 对手棋子
        testBoard[6][5] = 2; // 对手棋子
        testBoard[7][5] = 0; // 空位
        testBoard[8][5] = 2; // 对手棋子
        
        console.log('双活三威胁测试棋盘:');
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row = '';
            for (let j = 0; j < BOARD_SIZE; j++) {
                row += testBoard[i][j] + ' ';
            }
            console.log(row);
        }
        
        // 测试AI的双活三检测
        const ai = new SmartAI(testBoard, 1);
        
        // 检查AI是否能检测到双活三威胁
        const doubleLiveThreeThreat = ai.findDoubleLiveThreeThreat();
        console.log('AI检测到的双活三威胁:', doubleLiveThreeThreat);
        
        // 检查复杂威胁分析
        const complexThreats = ai.analyzeComplexThreats();
        console.log('AI检测到的复杂威胁:', complexThreats);
        
        // 测试紧急防守检测
        const emergencyDefense = ai.needsEmergencyDefense();
        console.log('紧急防守检测结果:', emergencyDefense);
        
        console.log('=== 双活三威胁测试完成 ===');
    }
    
    // 初始化游戏
    drawBoard();
    updateGameStatus();
    startTimer();
    
    // 运行斜对角线检测测试
    setTimeout(testDiagonalDetection, 1000);
    
    // 运行活三威胁检测测试
    setTimeout(testLiveThreeDetection, 1500);
    
    // 运行双活三威胁检测测试
    setTimeout(testDoubleLiveThreeDetection, 2000);
    
    // 测试AI进攻能力
    setTimeout(() => {
        console.log('=== 测试AI进攻能力 ===');
        
        // 创建一个测试棋盘，AI有获胜机会
        const testBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        
        // 在棋盘边缘放置AI棋子，测试AI是否会主动连接
        testBoard[0][0] = 1; // AI棋子
        testBoard[0][1] = 1; // AI棋子
        testBoard[0][2] = 1; // AI棋子
        testBoard[0][3] = 1; // AI棋子
        // 空位在 [0][4]，AI应该选择这里获胜
        
        console.log('进攻测试棋盘:');
        for (let i = 0; i < BOARD_SIZE; i++) {
            let row = '';
            for (let j = 0; j < BOARD_SIZE; j++) {
                row += testBoard[i][j] + ' ';
            }
            console.log(row);
        }
        
        const ai = new SmartAI(testBoard, 1);
        
        // 测试AI是否能发现获胜机会
        const bestMove = ai.getBestMove();
        console.log('AI选择的位置:', bestMove);
        
        if (bestMove && bestMove.row === 0 && bestMove.col === 4) {
            console.log('✓ AI正确发现了获胜机会！');
        } else {
            console.log('✗ AI没有发现获胜机会');
        }
        
        // 测试连接能力
        const connectionMoves = ai.findConnectionMoves();
        console.log('AI发现的连接机会:', connectionMoves.length, '个');
        if (connectionMoves.length > 0) {
            console.log('最佳连接位置:', connectionMoves[0]);
        }
        
        console.log('=== AI进攻能力测试完成 ===');
    }, 2500);

    // AI落子
    function makeAIMove() {
        if (!gameActive || gameMode !== 'pve' || currentPlayer !== aiPlayer) {
            return;
        }
        
        // 延迟AI响应，模拟思考时间
        setTimeout(() => {
            try {
                const ai = new SmartAI(gameBoard, aiPlayer, aiDifficulty);
                
                // 检查是否是开局阶段
                const openingMove = ai.getOpeningMove();
                let bestMove = openingMove;
                
                if (!openingMove) {
                    // 不是开局阶段，使用智能搜索
                    bestMove = ai.getBestMove();
                }
                
                // 调试信息：检查AI是否识别了威胁
                const threats = ai.analyzeThreats();
                if (threats.length > 0) {
                    console.log('AI识别到威胁位置:', threats.length, '个');
                }
                
                // 调试信息：检查活三威胁
                const liveThreeThreats = ai.detectLiveThreePatterns(aiPlayer === 1 ? 2 : 1);
                if (liveThreeThreats.length > 0) {
                    console.log('AI检测到活三威胁:', liveThreeThreats.length, '个');
                    console.log('活三威胁位置:', liveThreeThreats);
                }
                
                // 调试信息：检查紧急防守
                const emergencyDefense = ai.needsEmergencyDefense();
                if (emergencyDefense) {
                    console.log('AI需要紧急防守:', emergencyDefense);
                }
                
                // 调试信息：检查复杂威胁
                const complexThreats = ai.analyzeComplexThreats();
                if (complexThreats.length > 0) {
                    console.log('AI检测到复杂威胁:', complexThreats.length, '个');
                    console.log('复杂威胁详情:', complexThreats);
                }
                
                // 调试信息：检查双活三威胁
                const doubleLiveThreeThreat = ai.findDoubleLiveThreeThreat();
                if (doubleLiveThreeThreat) {
                    console.log('AI检测到双活三威胁:', doubleLiveThreeThreat);
                }
                
                if (bestMove) {
                    // 落子
                    gameBoard[bestMove.row][bestMove.col] = aiPlayer;
                    moveHistory.push({row: bestMove.row, col: bestMove.col, player: aiPlayer});
                    
                    // 绘制棋盘
                    drawBoard();
                    
                    // 检查是否胜利
                    if (checkWin(bestMove.row, bestMove.col, aiPlayer)) {
                        showWinModal(aiPlayer);
                        return;
                    }
                    
                    // 检查是否平局
                    if (checkDraw()) {
                        gameActive = false;
                        stopTimer();
                        statusText.textContent = '游戏结束 - 平局!';
                        return;
                    }
                    
                    // 切换玩家
                    currentPlayer = aiPlayer === 1 ? 2 : 1;
                    updateGameStatus();
                } else {
                    // 如果没有找到最佳移动，随机选择一个位置
                    const emptyPositions = [];
                    for (let i = 0; i < BOARD_SIZE; i++) {
                        for (let j = 0; j < BOARD_SIZE; j++) {
                            if (gameBoard[i][j] === 0) {
                                emptyPositions.push({row: i, col: j});
                            }
                        }
                    }
                    
                    if (emptyPositions.length > 0) {
                        const randomMove = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                        gameBoard[randomMove.row][randomMove.col] = aiPlayer;
                        moveHistory.push({row: randomMove.row, col: randomMove.col, player: aiPlayer});
                        
                        drawBoard();
                        
                        if (checkWin(randomMove.row, randomMove.col, aiPlayer)) {
                            showWinModal(aiPlayer);
                            return;
                        }
                        
                        if (checkDraw()) {
                            gameActive = false;
                            stopTimer();
                            statusText.textContent = '游戏结束 - 平局!';
                            return;
                        }
                        
                        currentPlayer = aiPlayer === 1 ? 2 : 1;
                        updateGameStatus();
                    }
                }
            } catch (error) {
                console.error('AI思考出错:', error);
                // 出错时随机落子
                const emptyPositions = [];
                for (let i = 0; i < BOARD_SIZE; i++) {
                    for (let j = 0; j < BOARD_SIZE; j++) {
                        if (gameBoard[i][j] === 0) {
                            emptyPositions.push({row: i, col: j});
                        }
                    }
                }
                
                if (emptyPositions.length > 0) {
                    const randomMove = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                    gameBoard[randomMove.row][randomMove.col] = aiPlayer;
                    moveHistory.push({row: randomMove.row, col: randomMove.col, player: aiPlayer});
                    
                    drawBoard();
                    
                    if (checkWin(randomMove.row, randomMove.col, aiPlayer)) {
                        showWinModal(aiPlayer);
                        return;
                    }
                    
                    if (checkDraw()) {
                        gameActive = false;
                        stopTimer();
                        statusText.textContent = '游戏结束 - 平局!';
                        return;
                    }
                    
                    currentPlayer = aiPlayer === 1 ? 2 : 1;
                    updateGameStatus();
                }
            }
        }, 200); // 进一步减少延迟时间
    }
    
    // 落子处理
    function handleMove(row, col) {
        // 检查坐标是否在棋盘内且为空
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && gameBoard[row][col] === 0) {
            // 落子
            gameBoard[row][col] = currentPlayer;
            moveHistory.push({row, col, player: currentPlayer});
            
            // 添加落子动画效果
            drawBoard();
            
            // 检查是否胜利
            if (checkWin(row, col, currentPlayer)) {
                showWinModal(currentPlayer);
                return;
            }
            
            // 检查是否平局
            if (checkDraw()) {
                gameActive = false;
                stopTimer();
                statusText.textContent = '游戏结束 - 平局!';
                return;
            }
            
            // 切换玩家
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateGameStatus();
            
            // 如果是人机模式，且轮到AI
            if (gameMode === 'pve' && currentPlayer === aiPlayer) {
                makeAIMove();
            }
        }
    }
    
    // 点击棋盘事件
    canvas.addEventListener('click', (e) => {
        if (!gameActive) return;
        
        // 在人机模式下，只有玩家回合才能点击
        if (gameMode === 'pve' && currentPlayer === aiPlayer) {
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // 计算点击的格子坐标
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const col = Math.round(x / CELL_SIZE);
        const row = Math.round(y / CELL_SIZE);
        
        handleMove(row, col);
    });
    
    // 鼠标悬停预览效果
    canvas.addEventListener('mousemove', (e) => {
        if (!gameActive) return;
        
        // 在人机模式下，只有玩家回合才能显示预览
        if (gameMode === 'pve' && currentPlayer === aiPlayer) {
            drawBoard();
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // 计算鼠标所在的格子坐标
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const col = Math.round(x / CELL_SIZE);
        const row = Math.round(y / CELL_SIZE);
        
        // 清除之前的预览
        drawBoard();
        
        // 如果坐标在棋盘内且为空，绘制预览棋子
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && gameBoard[row][col] === 0) {
            ctx.beginPath();
            ctx.arc(col * CELL_SIZE, row * CELL_SIZE, PIECE_SIZE / 2, 0, Math.PI * 2);
            
            if (currentPlayer === 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            }
            
            ctx.fill();
        }
    });
    
    // 鼠标离开棋盘时重绘
    canvas.addEventListener('mouseleave', () => {
        drawBoard();
    });
    
    // 事件监听
    restartBtn.addEventListener('click', resetGame);
    undoBtn.addEventListener('click', undoMove);
    newGameBtn.addEventListener('click', resetGame);
    
    // 模式切换
    pvpBtn.addEventListener('click', () => {
        if (gameMode !== 'pvp') {
            gameMode = 'pvp';
            resetGame();
        }
    });
    
    pveBtn.addEventListener('click', () => {
        if (gameMode !== 'pve') {
            gameMode = 'pve';
            resetGame();
        }
    });
});
