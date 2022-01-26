import React from 'react';

import Tile from './Tile';

export default function Guess({active, dispatch, guess, loading, row}) {
  return (
    <section
      aria-label={`Guess ${row + 1}: ${guess.map(g => g[0]).join('')}`}
      className="guess">
      {guess.map(([letter, score], i) => (
          <Tile
            key={i}
            active={active}
            dispatch={dispatch}
            index={i}
            letter={letter}
            loading={loading}
            row={row}
            score={score}
          />
      ))}
    </section>
  );
}
