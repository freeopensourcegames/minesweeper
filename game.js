let boardSize, mineCount;
let board, minePositions;

function createBoard(size, mines) {
    boardSize = size;
    mineCount = mines;
    board = [];
    minePositions = new Set();

    for (let i = 0; i < boardSize * boardSize; i++) {
        board.push({
            revealed: false,
            isMine: false,
            adjacentMines: 0,
        });
    }

    placeMines();
    calculateAdjacentMines();
    renderBoard();
}

function placeMines() {
    while (minePositions.size < mineCount) {
        const pos = Math.floor(Math.random() * board.length);
        minePositions.add(pos);
    }

    minePositions.forEach(pos => {
        board[pos].isMine = true;
    });
}

function calculateAdjacentMines() {
    minePositions.forEach(pos => {
        const neighbors = getNeighbors(pos);
        neighbors.forEach(n => {
            if (!board[n].isMine) {
                board[n].adjacentMines++;
            }
        });
    });
}

function getNeighbors(index) {
    const neighbors = [];
    const rowIndex = Math.floor(index / boardSize);
    const colIndex = index % boardSize;

    for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
            if (row === 0 && col === 0) continue;
            const neighborRow = rowIndex + row;
            const neighborCol = colIndex + col;

            if (
                neighborRow >= 0 && neighborRow < boardSize &&
                neighborCol >= 0 && neighborCol < boardSize
            ) {
                neighbors.push(neighborRow * boardSize + neighborCol);
            }
        }
    }
    return neighbors;
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardElement.innerHTML = '';

    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        if (cell.revealed) {
            cellElement.classList.add('revealed');
            if (cell.isMine) {
                cellElement.classList.add('mine');
                cellElement.textContent = '💣';
            } else if (cell.adjacentMines > 0) {
                cellElement.textContent = cell.adjacentMines;
            }
        }
        cellElement.addEventListener('click', () => revealCell(index));
        boardElement.appendChild(cellElement);
    });
}

function revealCell(index) {
    const cell = board[index];
    if (cell.revealed) return;

    cell.revealed = true;
    if (cell.isMine) {
        revealAllMines();
        renderBoard();
        setTimeout(() => alert('Game Over!'), 300);
    } else {
        if (cell.adjacentMines === 0) {
            revealConnectedSafeCells(index);
        }
        checkWinCondition();
        renderBoard();
    }
}

function revealConnectedSafeCells(index) {
    const stack = [index];

    while (stack.length > 0) {
        const current = stack.pop();
        const currentCell = board[current];

        currentCell.revealed = true;
        if (currentCell.adjacentMines === 0) {
            const neighbors = getNeighbors(current);
            neighbors.forEach(neighbor => {
                const neighborCell = board[neighbor];
                if (!neighborCell.revealed && !neighborCell.isMine) {
                    stack.push(neighbor);
                }
            });
        }
    }
}

function revealAllMines() {
    board.forEach(cell => {
        if (cell.isMine) cell.revealed = true;
    });
}

function checkWinCondition() {
    const allSafeCellsRevealed = board.every(cell => {
        return cell.revealed || cell.isMine;
    });

    if (allSafeCellsRevealed) {
        renderBoard();
        setTimeout(() => alert('Winner!'), 300);
    }
}

document.getElementById('game-settings').addEventListener('submit', (event) => {
    event.preventDefault();

    const sizeInput = document.getElementById('field-size').value;
    const minesInput = document.getElementById('mine-count').value;

    const size = parseInt(sizeInput, 10);
    const mines = parseInt(minesInput, 10);

    createBoard(size, mines);
});
