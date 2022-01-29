import React from 'react';

import {countFound} from '../scores';

const WORD_COUNT_BY_GUESS_LENGTH = [1, 66, 1716, 6414, 4086, 645, 40, 4];

export default function Scores({forceRefresh}) {
  return <section id="scores" aria-labelledby="scores-title">
    <h2 id="scores-title">Score distribution</h2>
    <div className="scores-grid">
      <div className="score-guess-number header">Guesses</div>
      <div className="score-slider header">Progress</div>
      <div className="score header">Found</div>
      {WORD_COUNT_BY_GUESS_LENGTH.map((totalCount, i) => {
        const found = countFound(i);
        const pct = found / totalCount * 100;
        return (
          <React.Fragment key={i}>
            <div
              aria-label={`${i + 1} ${i === 0 ? 'guess' : 'guesses'}`}
              className="score-guess-number">{i + 1}</div>
            <div
              aria-label={`${Math.round(pct * 10) / 10} percent complete`}
              className="score-slider">
              <div className="score-slider-background" />
              <div
                className="score-slider-foreground"
                style={{width: `${pct}%`}}
              />
            </div>
            <div aria-label={`${found} of ${totalCount} ${totalCount === 1 ? 'word' : 'words'} found`} className="score" key={i}>
              {found}/{totalCount}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </section>;
}
