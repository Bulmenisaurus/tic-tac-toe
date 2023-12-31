"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/moves.ts
  var addIfUnique, potentialMoveSquares, generateAllMoves;
  var init_moves = __esm({
    "src/moves.ts"() {
      "use strict";
      addIfUnique = (tiles, coordinate) => {
        const alreadyContainsCoordinate = tiles.some(
          ({ x, y }) => x === coordinate.x && y === coordinate.y
        );
        if (!alreadyContainsCoordinate) {
          tiles.push(coordinate);
        }
      };
      potentialMoveSquares = (board) => {
        const tiles = [];
        board.pieces.forEach((p) => {
          addIfUnique(tiles, { x: p.x + 1, y: p.y });
          addIfUnique(tiles, { x: p.x, y: p.y - 1 });
          addIfUnique(tiles, { x: p.x - 1, y: p.y });
          addIfUnique(tiles, { x: p.x, y: p.y + 1 });
          addIfUnique(tiles, { x: p.x - 1, y: p.y + 1 });
          addIfUnique(tiles, { x: p.x + 1, y: p.y + 1 });
          addIfUnique(tiles, { x: p.x + 1, y: p.y - 1 });
          addIfUnique(tiles, { x: p.x - 1, y: p.y - 1 });
        });
        return tiles.filter((tile) => board.getPiece(tile.x, tile.y) === void 0);
      };
      generateAllMoves = (board, pieceColor) => {
        return potentialMoveSquares(board).map((tile) => ({ x: tile.x, y: tile.y, piece: pieceColor }));
      };
    }
  });

  // src/ai.ts
  var findMove, orderMoves, evaluateMove, recursiveBoardSearchAlphaBeta, evaluate, countPlayerScore, gameCompleted;
  var init_ai = __esm({
    "src/ai.ts"() {
      "use strict";
      init_moves();
      findMove = (board, aiColor, difficulty) => {
        if (gameCompleted(board)) {
          return void 0;
        }
        const moveDepthSearch = 10;
        const allMoves = generateAllMoves(board, aiColor);
        const orderedMoves = orderMoves(allMoves, aiColor);
        let bestMoves = [];
        let bestMoveScore = -Infinity;
        const startTime = Date.now();
        for (const move of orderedMoves) {
          board.doMove(move);
          let ourScore = 0;
          if (gameCompleted(board)) {
            ourScore = evaluate(board, aiColor);
          } else {
            const opponentScore = recursiveBoardSearchAlphaBeta(
              moveDepthSearch,
              board,
              aiColor === "cross" ? "circle" : "cross",
              -Infinity,
              Infinity
            );
            ourScore = -opponentScore;
          }
          board.undoMove(move);
          board.isFinished = false;
          board.winningPlayer = void 0;
          if (ourScore > bestMoveScore) {
            bestMoveScore = ourScore;
            bestMoves = [move];
          } else if (ourScore === bestMoveScore) {
            bestMoves.push(move);
          }
        }
        const endTime = Date.now();
        console.log(`Took ${endTime - startTime}ms to evaluate positions (difficulty=${difficulty})`);
        console.log(`Choosing one of ${bestMoves.length} options (score=${bestMoveScore})`);
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
      };
      orderMoves = (moves, playerToMove) => {
        return moves.sort((moveA, moveB) => {
          return evaluateMove(moveA, playerToMove) - evaluateMove(moveB, playerToMove);
        }).reverse();
      };
      evaluateMove = (move, playerToMove) => {
        return 0;
      };
      recursiveBoardSearchAlphaBeta = (depth, board, playerToMove, alpha, beta) => {
        const playerFinished = gameCompleted(board);
        if (depth === 0 || playerFinished) {
          return evaluate(board, playerToMove);
        }
        const moves = generateAllMoves(board, playerToMove);
        for (const move of moves) {
          board.doMove(move);
          const evaluation = -recursiveBoardSearchAlphaBeta(
            depth - 1,
            board,
            playerToMove === "cross" ? "circle" : "cross",
            -beta,
            -alpha
          );
          board.undoMove(move);
          if (evaluation >= beta) {
            return beta;
          }
          alpha = Math.max(alpha, evaluation);
        }
        return alpha;
      };
      evaluate = (board, playerToMove) => {
        const circleScore = countPlayerScore("circle", board);
        const crossScore = countPlayerScore("cross", board);
        const evaluation = circleScore - crossScore;
        const perspective = playerToMove === "circle" ? 1 : -1;
        return evaluation * perspective;
      };
      countPlayerScore = (player, board) => {
        if (board.isFinished && board.winningPlayer === player) {
          return 1;
        }
        return 0;
      };
      gameCompleted = (board) => {
        return board.isFinished;
      };
    }
  });

  // src/board.ts
  var Board;
  var init_board = __esm({
    "src/board.ts"() {
      "use strict";
      Board = class {
        constructor() {
          this.pieces = [];
          this.isFinished = false;
        }
        getPiece(x, y) {
          var _a;
          return (_a = this.pieces.find((p) => p.x === x && p.y === y)) == null ? void 0 : _a.type;
        }
        setPiece(x, y, pieceColor) {
          this.pieces.push({ x, y, type: pieceColor });
          if (this.is5LineThroughTile(x, y, pieceColor)) {
            this.isFinished = true;
            this.winningPlayer = pieceColor;
          }
        }
        removePiece(x, y) {
          const pieceIndex = this.pieces.findIndex((p) => p.x === x && p.y === y);
          if (pieceIndex === -1) {
            throw new Error(`Piece at ${x}, ${y} does not exists`);
          }
          this.pieces.splice(pieceIndex, 1);
        }
        getTileColor(x, y) {
          return ["white", "black"][(x + y) % 2];
        }
        doMove(move) {
          this.setPiece(move.x, move.y, move.piece);
        }
        undoMove(move) {
          this.removePiece(move.x, move.y);
        }
        is5LineThroughTile(x, y, piece) {
          let inARow = 0;
          const check = (tx, ty) => {
            if (this.getPiece(tx, ty) == piece) {
              inARow++;
            } else {
              inARow = 0;
            }
            if (inARow == 5) {
              return true;
            }
          };
          for (let tx = x - 4, ty = y; tx <= x + 4; tx++) {
            if (check(tx, ty)) {
              return true;
            }
          }
          for (let tx = x, ty = y - 4; ty <= y + 4; ty++) {
            if (check(tx, ty)) {
              return true;
            }
          }
          for (let tx = x - 4, ty = y - 4; tx <= x + 4; tx++, ty++) {
            if (check(tx, ty)) {
              return true;
            }
          }
          for (let tx = x + 4, ty = y - 4; ty <= y + 4; tx--, ty++) {
            if (check(tx, ty)) {
              return true;
            }
          }
          return false;
        }
      };
    }
  });

  // src/gameBoard.ts
  var GameBoard;
  var init_gameBoard = __esm({
    "src/gameBoard.ts"() {
      "use strict";
      init_ai();
      init_board();
      GameBoard = class {
        constructor(boardElement) {
          this.board = new Board();
          this.currentTurn = "cross";
          this.boardElement = boardElement;
          this.difficulty = "easy";
        }
        setPiece(x, y, pieceType) {
          this.board.setPiece(x, y, pieceType);
        }
        getTileColor(x, y) {
          return this.board.getTileColor(x, y);
        }
        onClick(event, scrollableCanvas) {
          const mouseX = event.offsetX;
          const mouseY = event.offsetY;
          const { x, y } = scrollableCanvas.canvasToGameCoord(mouseX, mouseY);
          const boardTileX = Math.floor(x);
          const boardTileY = Math.floor(y);
          this.onTileClick(boardTileX, boardTileY);
        }
        onTileClick(tileX, tileY) {
          if (this.currentTurn !== "cross") {
            console.warn("not your turn");
            return;
          }
          this.tryMove(tileX, tileY);
        }
        aiMove() {
          const move = findMove(this.board, this.currentTurn, this.difficulty);
          this.currentTurn = this.currentTurn === "cross" ? "circle" : "cross";
          if (move === void 0) {
            console.warn("AI has no response, probably end of game?");
          } else {
            this.doMove(move);
          }
        }
        doMove(move) {
          this.board.setPiece(move.x, move.y, move.piece);
        }
        tryMove(x, y) {
          if (this.board.getPiece(x, y) !== void 0) {
            return;
          }
          this.doMove({ x, y, piece: this.currentTurn });
          this.currentTurn = this.currentTurn === "cross" ? "circle" : "cross";
          window.setTimeout(() => {
            this.aiMove();
          }, 1e3);
        }
      };
    }
  });

  // src/render.ts
  var drawGridLines, drawPieces, debugSquares, renderBoard;
  var init_render = __esm({
    "src/render.ts"() {
      "use strict";
      init_moves();
      drawGridLines = (interactiveCanvas, ctx) => {
        const viewPort = interactiveCanvas.getViewPort();
        const startXSnapped = Math.floor(viewPort.topLeft.x);
        for (let x = startXSnapped; x < viewPort.bottomRight.x; x += 1) {
          const startCoordGame = { x, y: viewPort.topLeft.y };
          const endCoordGame = { x, y: viewPort.bottomRight.y };
          const startCoordCanvas = interactiveCanvas.gameToCanvasCoord(
            startCoordGame.x,
            startCoordGame.y
          );
          const endCoordCanvas = interactiveCanvas.gameToCanvasCoord(endCoordGame.x, endCoordGame.y);
          ctx.beginPath();
          ctx.moveTo(startCoordCanvas.x, startCoordCanvas.y);
          ctx.lineTo(endCoordCanvas.x, endCoordCanvas.y);
          ctx.stroke();
        }
        const startYSnapped = Math.floor(viewPort.topLeft.y);
        for (let y = startYSnapped; y < viewPort.bottomRight.y; y += 1) {
          const startCoordGame = { x: viewPort.topLeft.x, y };
          const endCoordGame = { x: viewPort.bottomRight.x, y };
          const startCoordCanvas = interactiveCanvas.gameToCanvasCoord(
            startCoordGame.x,
            startCoordGame.y
          );
          const endCoordCanvas = interactiveCanvas.gameToCanvasCoord(endCoordGame.x, endCoordGame.y);
          ctx.beginPath();
          ctx.moveTo(startCoordCanvas.x, startCoordCanvas.y);
          ctx.lineTo(endCoordCanvas.x, endCoordCanvas.y);
          ctx.stroke();
        }
      };
      drawPieces = (board, interactiveCanvas, ctx) => {
        const viewPort = interactiveCanvas.getViewPort();
        for (const piece of board.board.pieces) {
          if (piece.type === "cross") {
            const pieceCanvasCoord = interactiveCanvas.gameToCanvasCoord(
              piece.x + 0.2,
              piece.y + 0.2
            );
            const size = interactiveCanvas.gameToCanvasDistance(0.6);
            ctx.fillStyle = "red";
            ctx.fillRect(pieceCanvasCoord.x, pieceCanvasCoord.y, size, size);
          } else {
            const pieceCanvasCoord = interactiveCanvas.gameToCanvasCoord(
              piece.x + 1 / 2,
              piece.y + 1 / 2
            );
            const radius = interactiveCanvas.gameToCanvasDistance(1 / 2 * (2 / 3));
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(pieceCanvasCoord.x, pieceCanvasCoord.y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };
      debugSquares = (interactiveCanvas, ctx, squares) => {
        for (const tile of squares) {
          const canvasCoords = interactiveCanvas.gameToCanvasCoord(tile.x, tile.y);
          const size = interactiveCanvas.gameToCanvasDistance(1);
          ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
          ctx.fillRect(canvasCoords.x, canvasCoords.y, size, size);
        }
      };
      renderBoard = (board, interactiveCanvas) => {
        const ctx = interactiveCanvas.canvasElement.getContext("2d");
        ctx.clearRect(
          0,
          0,
          interactiveCanvas.canvasElement.width,
          interactiveCanvas.canvasElement.height
        );
        ctx.fillStyle = "black";
        drawGridLines(interactiveCanvas, ctx);
        drawPieces(board, interactiveCanvas, ctx);
        debugSquares(interactiveCanvas, ctx, potentialMoveSquares(board.board));
        window.requestAnimationFrame(() => renderBoard(board, interactiveCanvas));
      };
    }
  });

  // src/event.ts
  function monomitter(emitLatestOnSubscribe = false) {
    const callbacks = /* @__PURE__ */ new Set();
    let valueBeenSet = false;
    let latestValue = void 0;
    function publish(value) {
      valueBeenSet = true;
      latestValue = value;
      callbacks.forEach((callback) => callback(value));
    }
    function subscribe(callback) {
      callbacks.add(callback);
      if (emitLatestOnSubscribe && valueBeenSet) {
        callback(latestValue);
      }
      return {
        unsubscribe() {
          callbacks.delete(callback);
        }
      };
    }
    function clear() {
      callbacks.clear();
    }
    return {
      publish,
      subscribe,
      clear
    };
  }
  var init_event = __esm({
    "src/event.ts"() {
      "use strict";
    }
  });

  // src/scrollableCanvas.ts
  var ScrollableCanvas;
  var init_scrollableCanvas = __esm({
    "src/scrollableCanvas.ts"() {
      "use strict";
      init_event();
      ScrollableCanvas = class {
        constructor(canvas) {
          this.canvasElement = canvas;
          this.canvasElementWidth = 500;
          this.canvasElementHeight = 500;
          this.canvasIsDragging = false;
          this.canvasStartPanX = 0;
          this.canvasStartPanY = 0;
          this.cameraPositionX = 0;
          this.cameraPositionY = 0;
          this.cameraZoom = 20;
          this.cameraPanDeltaX = 0;
          this.cameraPanDeltaY = 0;
          this.clickEvent = monomitter();
          this.resize();
          window.addEventListener("resize", (e) => this.resize());
          canvas.addEventListener("wheel", (e) => this.onWheel(e));
          canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
          canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
          canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        }
        resize() {
          const container = this.canvasElement.parentElement;
          const containerSize = container.getBoundingClientRect();
          this.canvasElementWidth = Math.round(containerSize.width);
          this.canvasElementHeight = Math.round(containerSize.height);
          this.canvasElement.width = this.canvasElementWidth;
          this.canvasElement.height = this.canvasElementHeight;
        }
        onWheel(e) {
          const scrollAmount = e.deltaY;
          e.preventDefault();
          const base = 1.005;
          const clamp = (min, x, max) => Math.max(Math.min(x, max), min);
          const targetZoom = this.cameraZoom * (1 / base ** scrollAmount);
          this.cameraZoom = clamp(6, targetZoom, 30);
        }
        onMouseDown(e) {
          this.canvasIsDragging = true;
          this.canvasStartPanX = e.offsetX;
          this.canvasStartPanY = e.offsetY;
        }
        onMouseUp(e) {
          this.canvasIsDragging = false;
          this.cameraPositionX += this.cameraPanDeltaX;
          this.cameraPositionY += this.cameraPanDeltaY;
          const isClick = this.cameraPanDeltaX ** 2 + this.cameraPanDeltaY ** 2 <= 1;
          this.cameraPanDeltaX = 0;
          this.cameraPanDeltaY = 0;
          if (isClick) {
            this.clickEvent.publish(e);
          }
        }
        onMouseMove(e) {
          if (!this.canvasIsDragging) {
            return;
          }
          this.cameraPanDeltaX = (e.offsetX - this.canvasStartPanX) / this.cameraZoom;
          this.cameraPanDeltaY = (e.offsetY - this.canvasStartPanY) / this.cameraZoom;
        }
        gameToCanvasCoord(x, y) {
          return {
            x: (x + this.cameraPositionX + this.cameraPanDeltaX) * this.cameraZoom,
            y: (y + this.cameraPositionY + this.cameraPanDeltaY) * this.cameraZoom
          };
        }
        canvasToGameCoord(x, y) {
          return {
            x: x / this.cameraZoom - this.cameraPositionX - this.cameraPanDeltaX,
            y: y / this.cameraZoom - this.cameraPositionY - this.cameraPanDeltaY
          };
        }
        gameToCanvasDistance(distance) {
          return distance * this.cameraZoom;
        }
        getViewPort() {
          const topLeft = this.canvasToGameCoord(0, 0);
          const bottomRight = this.canvasToGameCoord(
            this.canvasElement.width,
            this.canvasElement.height
          );
          return { topLeft, bottomRight };
        }
      };
    }
  });

  // src/index.ts
  var require_src = __commonJS({
    "src/index.ts"(exports) {
      init_gameBoard();
      init_render();
      init_scrollableCanvas();
      var main = (mainElement) => __async(exports, null, function* () {
        const boardContainer = document.createElement("canvas");
        boardContainer.id = "board-container";
        mainElement.appendChild(boardContainer);
        const board = new GameBoard(boardContainer);
        const interactiveCanvas = new ScrollableCanvas(boardContainer);
        interactiveCanvas.clickEvent.subscribe((e) => {
          board.onClick(e, interactiveCanvas);
        });
        renderBoard(board, interactiveCanvas);
      });
      window.addEventListener("load", () => {
        const mainElement = document.getElementsByTagName("main")[0];
        main(mainElement);
      });
    }
  });
  require_src();
})();
