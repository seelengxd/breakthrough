import "./App.css";
import { useState } from "react";
import Pawn from "./Pawn";
import CircleIcon from "@mui/icons-material/Circle";
import { Button } from "@mui/material";

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
    setPastMoves([...pastMoves, grid]);
    setFutureMoves([]);
    const newGrid = grid.map((row) => [...row]);
    const piece = grid[selectedPiece[0]][selectedPiece[1]];
    newGrid[selectedPiece[0]][selectedPiece[1]] = "";
    newGrid[i][j] = piece;
    setGrid(newGrid);
    deselect();
    if (checkWin(i)) {
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
  }

  function redo() {
    if (!futureMoves) {
      return;
    }
    setGrid(futureMoves.pop());
    changeTurn();
  }

  function deselect() {
    setSelectedPiece([-1, -1]);
    setMoveOptions([]);
  }

  function changeTurn() {
    setTurn(turn === "W" ? "B" : "W");
  }

  function checkWin(i) {
    return i === 0 || i === SIZE - 1;
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
          Undo
        </Button>
        <Button
          variant="contained"
          disabled={futureMoves.length === 0}
          onClick={redo}
        >
          Redo
        </Button>
      </div>
    </main>
  );
}

export default App;
