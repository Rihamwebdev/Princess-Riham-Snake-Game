// Game Configuration
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

// Game State
let canvas, ctx;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let gameStarted = false;

// Initialize
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    document.getElementById('highScore').textContent = highScore;
    
    // Draw initial screen
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Start Game to begin!', CANVAS_SIZE/2, CANVAS_SIZE/2);
};

// Start Game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Game Running...';
    
    initGame();
    gameLoop = setInterval(update, 100);
}

// Initialize Game State
function initGame() {
    // Create snake in center
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // Initial direction (moving right)
    dx = 1;
    dy = 0;
    
    score = 0;
    isGameOver = false;
    isPaused = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').classList.add('hidden');
    
    spawnFood();
}

// Spawn food at random location
function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (isSnakeAt(food.x, food.y));
}

// Check if snake is at position
function isSnakeAt(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Main Game Loop
function update() {
    if (isPaused || isGameOver) return;
    
    // Calculate new head position
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (isSnakeAt(head.x, head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    draw();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid (subtle)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head is brighter
        if (index === 0) {
            ctx.fillStyle = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff88';
        } else {
            ctx.fillStyle = '#4ecdc4';
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = '#000';
            ctx.shadowBlur = 0;
            const eyeSize = 3;
            const offset = 5;
            if (dx === 1) { // moving right
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (dx === -1) { // moving left
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            } else if (dy === -1) { // moving up
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, eyeSize, eyeSize);
            } else { // moving down
                ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 12, eyeSize, eyeSize);
            }
        }
    });
    
    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE/2,
        food.y * GRID_SIZE + GRID_SIZE/2,
        GRID_SIZE/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Game Over
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Restart Game
function restartGame() {
    clearInterval(gameLoop);
    document.getElementById('gameOver').classList.add('hidden');
    initGame();
    gameLoop = setInterval(update, 100);
}

// Keyboard Controls
document.addEventListener('keydown', function(e) {
    if (!gameStarted) return;
    
    // Prevent default for game keys
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // Pause
    if (e.key === ' ') {
        isPaused = !isPaused;
        return;
    }
    
    // Don't allow reversing direction
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});