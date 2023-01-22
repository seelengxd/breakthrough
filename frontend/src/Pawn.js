import { useState } from "react";
import pawnSrc from "./images/chess-pawn.svg";

function Pawn({ index, pawn, selected, handleClick }) {
  const classes = [];
  if (pawn == "W") classes.push("white");
  if (selected) classes.push("selected");
  return (
    pawn && (
      <img
        src={pawnSrc}
        className={classes.join(" ")}
        alt="pawn"
        key={index}
        onClick={handleClick}
      />
    )
  );
}

export default Pawn;
