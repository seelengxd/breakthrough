import "./App.css";
import { useState } from "react";
import Pawn from "./Pawn";
import CircleIcon from "@mui/icons-material/Circle";

function App() {
  const SIZE = 8;
  const [grid, setGrid] = useState([
    ["B", "B", "B", "B", "B", "B", "B", "B"],
    ["B", "B", "B", "B", "B", "B", "B", "B"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["W", "W", "W", "W", "W", "W", "W", "W"],
    ["W", "W", "W", "W", "W", "W", "W", "W"],
  ]);
  const [selectedPiece, setSelectedPiece] = useState([-1, -1]);
  const [moveOptions, setMoveOptions] = useState([]);

  function availableMoves(i, j, isBlack) {
    // assumption: this function won't be called after a win
    const i_difference = isBlack ? 1 : -1;

    const positions = [
      ...[
        [i_difference + i, j - 1],
        [i_difference + i, j + 1],
      ],
      ...[grid[i_difference + i][j] == "" ? [i_difference + i, j] : []],
    ];

    return positions.filter(
      (pos) =>
        0 <= pos[0] &&
        pos[0] < SIZE &&
        0 <= pos[1] &&
        pos[1] < SIZE &&
        grid[pos[0]][pos[1]] != (isBlack ? "B" : "W")
    );
  }

  function selectHelper(i, j) {
    const piece = grid[i][j];
    let moves;
    switch (piece) {
      case "W":
        moves = availableMoves(i, j, false);
        break;
      case "B":
        moves = availableMoves(i, j, true);
        break;
      case "":
        return;
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
    const newGrid = grid.map((row) => [...row]);
    const piece = grid[selectedPiece[0]][selectedPiece[1]];
    newGrid[selectedPiece[0]][selectedPiece[1]] = "";
    newGrid[i][j] = piece;
    setGrid(newGrid);
    setSelectedPiece([-1, -1]);
    setMoveOptions([]);
  }

  return (
    <main>
      <div id="grid">
        {grid.map((row, i) => (
          <div className="row">
            {row.map((pawn, j) => (
              <div className="square">
                <Pawn
                  index={i * 8 + j}
                  pawn={pawn}
                  selected={[i, j].toString() === selectedPiece.toString()}
                  handleClick={() => selectHelper(i, j)}
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
    </main>
  );
}

export default App;
