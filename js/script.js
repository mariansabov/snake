let body = document.querySelector("body");
let canvas = document.querySelector("#canvas");
let canvasHeader = document.querySelector("#canvas-header");
let ctxHeader = canvasHeader.getContext("2d");
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;
let blockSize = 20;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;
let score = 0;
let appleColor;
let snakeColor;
let taleDirection = 'right';

let gameHeader = document.querySelector(".game-header");
let gameScore = document.querySelector(".game-score");

// --- Change Apple Color ---

const radioApple = document.getElementsByName('apple-color');


if (!localStorage.getItem('myAppleKey')) {
    localStorage.setItem('myAppleKey', 0) 
}

let myAppleKey = localStorage.getItem('myAppleKey'); 

radioApple[myAppleKey].setAttribute('checked', '');

const onAppleChange = (e) => {
    if (e.id === 'ac1') {
        localStorage.setItem('myAppleKey', 0)
    } else if (e.id === 'ac2') {
        localStorage.setItem('myAppleKey', 1)
    } else if (e.id === 'ac3') {
        localStorage.setItem('myAppleKey', 2)
    }

    location.reload()
}

if (myAppleKey == 0) {
    appleColor = 1;
} else if (myAppleKey == 1) {
    appleColor = 0;
}

// --------------------------

// --- Change Snake Color ---
const radioSnake = document.getElementsByName('snake-color');

if (!localStorage.getItem('mySnakeKey')) {
    localStorage.setItem('mySnakeKey', 0) 
}

let mySnakeKey = localStorage.getItem('mySnakeKey'); 

radioSnake[mySnakeKey].setAttribute('checked', '');

const onSnakeChange = (e) => {
    if (e.id === 'sc1') {
        localStorage.setItem('mySnakeKey', 0)
    } else if (e.id === 'sc2') {
        localStorage.setItem('mySnakeKey', 1)
    } else if (e.id === 'sc3') {
        localStorage.setItem('mySnakeKey', 2)
    }

    location.reload()
}

if (mySnakeKey == 0) {
    snakeColor = "blue";
} else if (mySnakeKey == 1) {
    snakeColor = "green";
} else if (mySnakeKey == 2) {
    snakeColor = "purple";
}

// --------------------------

// CANVAS HEADER

let drawBacgroundScore = function () {
    ctxHeader.fillStyle = "gray";
    ctxHeader.fillRect(0, 0, width, 2 * blockSize);
}

let drawScore = function () {
    ctxHeader.font = "20px Courier";
    ctxHeader.fillStyle = "White";
    ctxHeader.textAlign = "left";
    ctxHeader.textBaseline = "top";
    ctxHeader.fillText("Счет: " + score, blockSize, blockSize);
    gameScore.innerHTML = `Счет: ${score}`;
}

//-------------------

let drawBorder = function () {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
}

let gameOver = function () {
    clearInterval(intervalId);
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры", width / 2, height / 2);
}

let circle = function (x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

let drawApple = function (x, y, a, checkColor) {
    let color = checkColor ? "Red" : "GreenYellow";

    // Тело яблока
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.fillRect(x + 3 * a, y, 4 * a, 1 * a);
    ctx.fillRect(x + 2 * a, y - 1 * a, 6 * a, 1 * a);
    ctx.fillRect(x + 1 * a, y - 2 * a, 8 * a, 1 * a);
    ctx.fillRect(x, y - 2 * a, 10 * a, -4 * a);
    ctx.fillRect(x + 1 * a, y - 7 * a, 8 * a, 1 * a);
    ctx.fillRect(x + 2 * a, y - 8 * a, 6 * a, 1 * a);

    // Палочка
    ctx.fillStyle = "Black";
    ctx.fillRect(x + 4.5 * a, y - 7 * a, 1 * a, -2 * a);
    ctx.fillRect(x + 4 * a, y - 10 * a, 1 * a, 1 * a);
    ctx.fillRect(x + 3.5 * a, y - 11 * a, 1 * a, 1 * a);

    // Лист
    ctx.fillStyle = "DarkGreen";
    ctx.fillRect(x + 5 * a, y - 10 * a, 2 * a, 1 * a);
    ctx.fillRect(x + 5 * a, y - 11 * a, 3 * a, 1 * a);
    ctx.fillRect(x + 6 * a, y - 12 * a, 2 * a, 1 * a);

    // Блик
    ctx.fillStyle = "White";
    ctx.fillRect(x + 3 * a, y - 7 * a, 1 * a, 1 * a);
    ctx.fillRect(x + 2 * a, y - 6 * a, 1 * a, 1 * a);
}

let Block = function (col, row) {
    this.col = col;
    this.row = row;
}

Block.prototype.drawSquare = function (color) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize)
}

Block.prototype.drawCircle = function (color) {
    let centerX = this.col * blockSize + blockSize / 2;
    let centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true)
}

Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
}

Block.prototype.drawApple = function (checkColor) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;

    drawApple(x, y + 18, 2, checkColor)
}

// SNAKE HEADS

Block.prototype.drawSnakeHead = function (direction) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;

    if (direction === 'up') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize, blockSize);
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 1 * blockSize / 10, 5 * blockSize / 10);
        ctx.fillRect(x + 1 * blockSize / 10, y, 1 * blockSize / 10, 2 * blockSize / 10);
        ctx.fillRect(x + 9 * blockSize / 10, y, 1 * blockSize / 10, 5 * blockSize / 10);
        ctx.fillRect(x + 8 * blockSize / 10, y, 1 * blockSize / 10, 2 * blockSize / 10);
        ctx.fillStyle = "black";
        ctx.fillRect(x + 3 * blockSize / 10, y, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 2 * blockSize / 10, y + 6 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y + 6 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
    } else if (direction === 'down') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize, blockSize)
        ctx.fillStyle = "white";
        ctx.fillRect(x, y + 5 * blockSize / 10, 1 * blockSize / 10, 5 * blockSize / 10);
        ctx.fillRect(x + 1 * blockSize / 10, y + 8 * blockSize / 10, 1 * blockSize / 10, 2 * blockSize / 10);
        ctx.fillRect(x + 9 * blockSize / 10, y + 5 * blockSize / 10, 1 * blockSize / 10, 5 * blockSize / 10);
        ctx.fillRect(x + 8 * blockSize / 10, y + 8 * blockSize / 10, 1 * blockSize / 10, 2 * blockSize / 10);
        ctx.fillStyle = "black";
        ctx.fillRect(x + 3 * blockSize / 10, y + 9 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y + 9 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 2 * blockSize / 10, y + 2 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y + 2 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
    } else if (direction === 'right') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize, blockSize);
        ctx.fillStyle = "white";
        ctx.fillRect(x + 5 * blockSize / 10, y, 5 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x + 8 * blockSize / 10, y + 1 * blockSize / 10, 2 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x + 5 * blockSize / 10, y + 9 * blockSize / 10, 5 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x + 8 * blockSize / 10, y + 8 * blockSize / 10, 2 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillStyle = "black";
        ctx.fillRect(x + 9 * blockSize / 10, y + 3 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 9 * blockSize / 10, y + 6 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 2 * blockSize / 10, y + 2 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
        ctx.fillRect(x + 2 * blockSize / 10, y + 6 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
    } else if (direction === 'left') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize, blockSize);
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 5 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x, y + 1 * blockSize / 10, 2 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x, y + 9 * blockSize / 10, 5 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillRect(x, y + 8 * blockSize / 10, 2 * blockSize / 10, 1 * blockSize / 10);
        ctx.fillStyle = "black";
        ctx.fillRect(x, y + 3 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x, y + 6 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y + 2 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
        ctx.fillRect(x + 6 * blockSize / 10, y + 6 * blockSize / 10, 2 * blockSize / 10, 2 * blockSize / 10)
    }
}

// SNAKE BODY

Block.prototype.drawSnakeBody = function () {
    let x = this.col * blockSize;
    let y = this.row * blockSize;

    ctx.fillStyle = snakeColor;
    ctx.fillRect(x, y, blockSize, blockSize)
    ctx.fillStyle = "yellow";
    ctx.fillRect(x + 3.5 * blockSize / 10, y + 3.5 * blockSize / 10, 3 * blockSize / 10, 3 * blockSize / 10)
    ctx.fillStyle = snakeColor;
    ctx.fillRect(x + 4.5 * blockSize / 10, y + 4.5 * blockSize / 10, 1 * blockSize / 10, 1 * blockSize / 10)
}

// SNAKE TAIL

Block.prototype.drawSnakeTail = function (direction) {
    let x = this.col * blockSize;
    let y = this.row * blockSize;

    if (direction === 'up') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize, blockSize / 2)
        ctx.beginPath();
        ctx.arc(x + 5 * blockSize / 10, y + 5 * blockSize / 10, blockSize / 2, 0, Math.PI);
        ctx.fill()
    } else if (direction === 'down') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y + 5 * blockSize / 10, blockSize, blockSize / 2)
        ctx.beginPath();
        ctx.arc(x + 5 * blockSize / 10, y + 5 * blockSize / 10, blockSize / 2, 0, Math.PI * 2);
        ctx.fill()
    } else if (direction === 'right') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x + 5 * blockSize / 10, y, blockSize / 2, blockSize)
        ctx.beginPath();
        ctx.arc(x + 5 * blockSize / 10, y + 5 * blockSize / 10, blockSize / 2, 0, Math.PI * 2);
        ctx.fill()
    } else if (direction === 'left') {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, blockSize / 2, blockSize)
        ctx.beginPath();
        ctx.arc(x + 5 * blockSize / 10, y + 5 * blockSize / 10, blockSize / 2, 0, Math.PI * 2);
        ctx.fill()
    }
}

// ---------------------------

let Snake = function () {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5),
    ]

    this.direction = "right";
    this.nextDirection = "right";
}

Snake.prototype.draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
        if (i === 0) {
            this.segments[i].drawSnakeHead(this.direction);
        } else if (i === this.segments.length - 1) {
            this.segments[i].drawSnakeTail(this.checkTail());
        } else {
            this.segments[i].drawSnakeBody();
        }
    }
}

Snake.prototype.move = function () {
    let head = this.segments[0];
    let newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkCollision(newHead)) {
        gameOver();
        return
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
        score++;
        apple.move();
    } else {
        this.segments.pop();
    }
}

Snake.prototype.checkCollision = function (head) {
    let leftCollision = (head.col === 0);
    let topCollision = (head.row === 0);
    let rightCollision = (head.col === widthInBlocks - 1);
    let bottomCollision = (head.row === heightInBlocks - 1);

    let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    let selfCollision = false;

    for (let i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }

    return wallCollision || selfCollision;
}

let direction = {
    65: "left",
    68: "right",
    83: "down",
    87: "up"
}

body.addEventListener('keydown', e => {
    let newDirection = direction[e.keyCode];
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
})

Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return
    } else if (this.direction === "right" && newDirection === "left") {
        return
    } else if (this.direction === "down" && newDirection === "up") {
        return
    } else if (this.direction === "left" && newDirection === "right") {
        return
    }

    this.nextDirection = newDirection;
}

Snake.prototype.checkTail = function () {
    if (snake.segments[snake.segments.length - 1].col == snake.segments[snake.segments.length - 2].col && snake.segments[snake.segments.length - 1].row > snake.segments[snake.segments.length - 2].row) {
        return "up";
    } else if (snake.segments[snake.segments.length - 1].col == snake.segments[snake.segments.length - 2].col && snake.segments[snake.segments.length - 1].row < snake.segments[snake.segments.length - 2].row) {
        return "down";
    } else if (snake.segments[snake.segments.length - 1].col < snake.segments[snake.segments.length - 2].col && snake.segments[snake.segments.length - 1].row == snake.segments[snake.segments.length - 2].row) {
        return "right";
    } else if (snake.segments[snake.segments.length - 1].col > snake.segments[snake.segments.length - 2].col && snake.segments[snake.segments.length - 1].row == snake.segments[snake.segments.length - 2].row) {
        return "left";
    }
}

let Apple = function () {
    this.position = new Block(10, 10);
}

Apple.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
}

Apple.prototype.draw = function () {
    this.position.drawApple(appleColor);
}

Apple.prototype.move = function () {
    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    let checkCollision = false;

    for (let i = 0; i < snake.segments.length; i++) {
        if (randomCol === snake.segments[i].col && randomRow === snake.segments[i].row) {
            checkCollision = true;
        }
    }

    if (checkCollision) {
        this.move();
    } else {
        this.position = new Block(randomCol, randomRow);
        if (myAppleKey == 2) {
            appleColor = Math.round(Math.random());
        }
    }
}

let apple = new Apple();
let snake = new Snake();

let intervalId = setInterval(() => {
    ctx.clearRect(0, 0, width, height);
    ctxHeader.clearRect(0, 0, width, 2 * blockSize);
    drawBacgroundScore();
    drawScore();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
    snake.checkTail()
}, 100);