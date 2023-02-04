import "./App.css";
import { useState } from "react";
import Pawn from "./Pawn";
import CircleIcon from "@mui/icons-material/Circle";
import { Button } from "@mui/material";
import {
  Bolt,
  ContentCopy,
  ContentPaste,
  DeleteForever,
  Flip,
  People,
  Redo,
  Undo,
} from "@mui/icons-material";
import axios from "axios";

function App() {
  const SIZE = 6;
  const [grid, setGrid] = useState([
    ["B", "B", "B", "B", "B", "B"],
    ["B", "B", "B", "B", "B", "B"],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["W", "W", "W", "W", "W", "W"],
    ["W", "W", "W", "W", "W", "W"],
  ]);
  const [selectedPiece, setSelectedPiece] = useState([-1, -1]);
  const [moveOptions, setMoveOptions] = useState([]);
  const [turn, setTurn] = useState("W");
  const [winner, setWinner] = useState("");
  const [pastMoves, setPastMoves] = useState([]);
  const [futureMoves, setFutureMoves] = useState([]);

  function getAvailableMoves(i, j, isBlack) {
    // assumption: this function won't be called after a win
    const i_difference = isBlack ? 1 : -1;

    const positions = [
      ...[
        [i_difference + i, j - 1],
        [i_difference + i, j + 1],
      ],
      ...[grid[i_difference + i][j] === "" ? [i_difference + i, j] : []],
    ];

    return positions.filter(
      (pos) =>
        0 <= pos[0] &&
        pos[0] < SIZE &&
        0 <= pos[1] &&
        pos[1] < SIZE &&
        grid[pos[0]][pos[1]] !== (isBlack ? "B" : "W")
    );
  }

  function select(i, j) {
    if (i === selectedPiece[0] && j === selectedPiece[1]) {
      deselect();
      return;
    }
    if (grid[i][j] !== turn) {
      return;
    }
    const piece = grid[i][j];
    let moves;
    switch (piece) {
      case "W":
        moves = getAvailableMoves(i, j, false);
        break;
      case "B":
        moves = getAvailableMoves(i, j, true);
        break;
      case "":
        return;
      default:
        console.error(`Invalid piece in grid: ${piece}`);
    }
    setSelectedPiece([i, j]);
    setMoveOptions(moves);
  }

  function isMoveOption(i, j) {
    return (
      moveOptions.filter((move) => move[0] === i && move[1] === j).length > 0
    );
  }

  function playMove(i, j) {
    movePiece(selectedPiece, [i, j]);
  }

  function movePiece(from, to) {
    setPastMoves([...pastMoves, grid]);
    setFutureMoves([]);
    const newGrid = grid.map((row) => [...row]);
    const piece = grid[from[0]][from[1]];
    newGrid[from[0]][from[1]] = "";
    newGrid[to[0]][to[1]] = piece;
    setGrid(newGrid);
    deselect();
    if (checkWin(to[0])) {
      setTurn(null);
      setWinner(piece);
    } else {
      changeTurn();
    }
  }

  function undo() {
    if (!pastMoves) {
      return;
    }
    setFutureMoves([...futureMoves, grid]);
    setGrid(pastMoves.pop());
    changeTurn();
    deselect();
    setWinner("");
  }

  function redo() {
    if (!futureMoves) {
      return;
    }
    setPastMoves([...pastMoves, grid]);
    const board = futureMoves.pop();
    setGrid(board);
    changeTurn();
    deselect();

    // test win condition
    checkBoardWinner(board);
  }

  function checkBoardWinner(board) {
    let winner = "";

    for (let i = 0; i < SIZE; i++) {
      if (board[0][i] === "W") {
        winner = "W";
        break;
      }
    }

    for (let i = 0; i < SIZE; i++) {
      if (board[SIZE - 1][i] === "B") {
        winner = winner ? "INVALID" : "B";
        break;
      }
    }

    if (winner) {
      setTurn(null);
      setWinner(winner);
    }
  }

  function deselect() {
    setSelectedPiece([-1, -1]);
    setMoveOptions([]);
  }

  function changeTurn() {
    setTurn(turn === "W" ? "B" : "W");
    deselect();
  }

  function checkWin(i) {
    return i === 0 || i === SIZE - 1;
  }

  function stringifyBoard(grid) {
    let res = "[";
    const stringGrid = grid.map((row) =>
      row.map((piece) => `'${piece || "_"}'`)
    );
    stringGrid.forEach((row) => (res += "[" + row + "],\n"));
    res = res.slice(0, res.length - 2) + "]";
    return res;
  }

  function copy() {
    navigator.clipboard.writeText(stringifyBoard(grid));
  }

  function paste() {
    navigator.clipboard
      .readText()
      .catch((err) => alert("Give the app permission to read your clipboard!"))
      .then((stringGrid) => {
        console.log(stringGrid.replace(/'/g, '"'));
        return stringGrid.replace(/'/g, '"');
      })
      .then((stringGrid) => JSON.parse(stringGrid))
      .catch(() =>
        alert(
          "Invalid array... take a look at Copy to see what we are expecting."
        )
      )
      .then((newGrid) => {
        // Validate it is a valid grid
        if (!Array.isArray(newGrid)) {
          throw new Error("This is not an array.");
        }
        if (newGrid.length !== SIZE) {
          throw new Error(`Grid should have ${SIZE} rows.`);
        }
        newGrid.forEach((row, index) => {
          if (row.length !== SIZE) {
            throw new Error(`Row ${index} should have ${SIZE} characters.`);
          }
          if (row.some((element) => !["", "B", "W", "_"].includes(element))) {
            throw new Error(
              `Element that is not in ['', "B", "W", " "] detected in Row ${index}`
            );
          }
        });
        setGrid(
          newGrid.map((row) =>
            row.map((element) => (element === "_" ? "" : element))
          )
        );
        // reset everything
        deselect();
        setFutureMoves([]);
        setPastMoves([]);
        checkBoardWinner(newGrid);
      })
      .catch((err) => alert(err));
  }

  function invert_board(board) {
    const new_board = board.map((row) =>
      row.map((element) => (element === "B" ? "W" : element === "W" ? "B" : ""))
    );
    new_board.reverse();
    return new_board;
  }

  function invert() {
    const newGrid = invert_board(grid);
    setGrid(newGrid);
    setPastMoves(pastMoves.map(invert_board));
    setFutureMoves(futureMoves.map(invert_board));
    changeTurn();
    deselect();
    checkBoardWinner(newGrid);
  }

  function reset() {
    setGrid([
      ["B", "B", "B", "B", "B", "B"],
      ["B", "B", "B", "B", "B", "B"],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
      ["W", "W", "W", "W", "W", "W"],
      ["W", "W", "W", "W", "W", "W"],
    ]);
    setPastMoves([]);
    setFutureMoves([]);
    setTurn("W");
    deselect();
    setWinner("");
  }

  function getMoveFromBot() {
    if (winner) return;
    axios
      .post(
        "http://127.0.0.1:5000",
        { board: stringifyBoard(grid), turn },
        { withCredentials: false }
      )
      .then((res) => res.data)
      .then((data) => {
        movePiece(...data);
      });
  }

  return (
    <main>
      {winner ? <h1>Winner: {winner}</h1> : <h1>Turn: {turn}</h1>}
      <div id="grid">
        {grid.map((row, i) => (
          <div className="row" key={i}>
            {row.map((pawn, j) => (
              <div className="square" key={i * SIZE + j}>
                <Pawn
                  index={i * 8 + j}
                  pawn={pawn}
                  selected={[i, j].toString() === selectedPiece.toString()}
                  handleClick={() => select(i, j)}
                ></Pawn>
                {isMoveOption(i, j) && (
                  <CircleIcon
                    color="secondary"
                    sx={{ opacity: 0.5, position: "absolute" }}
                    onClick={() => playMove(i, j)}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div id="buttons">
        <Button
          variant="contained"
          disabled={pastMoves.length === 0}
          onClick={undo}
        >
          <Undo /> Undo
        </Button>
        <Button
          variant="contained"
          disabled={futureMoves.length === 0}
          onClick={redo}
        >
          <Redo /> Redo
        </Button>
        <Button variant="contained" color="warning" onClick={invert}>
          <Flip /> Invert
        </Button>
        <Button variant="contained" color="warning" onClick={changeTurn}>
          <People /> Switch Turn
        </Button>
        <Button variant="contained" color="error" onClick={reset}>
          <DeleteForever /> Reset
        </Button>
        <Button variant="contained" color="secondary" onClick={copy}>
          <ContentCopy /> Copy
        </Button>
        <Button variant="contained" color="secondary" onClick={paste}>
          <ContentPaste /> Paste
        </Button>
        <Button variant="contained" onClick={getMoveFromBot}>
          <Bolt /> Bot Move
        </Button>
      </div>
    </main>
  );
}

export default App;
