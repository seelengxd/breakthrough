import { useState } from "react";
import pawnSrc from "./images/chess-pawn.svg";

function Pawn({ index, pawn }) {
  const classes = [];
  const [selected, setSelected] = useState(false);
  if (pawn == "W") classes.push("white");
  if (selected) classes.push("selected");
  return (
    <div className="square" key={index} onClick={() => setSelected(!selected)}>
      {pawn && <img src={pawnSrc} className={classes.join(" ")} alt="pawn" />}
    </div>
  );
}

export default Pawn;
