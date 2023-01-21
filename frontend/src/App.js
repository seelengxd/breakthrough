import "./App.css";
import { useState } from "react";
import Pawn from "./Pawn";
function App() {
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
  return (
    <main>
      <div id="grid">
        {grid.map((row) => (
          <div class="row">
            {row.map((pawn, index) => (
              <Pawn index={index} pawn={pawn}></Pawn>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
