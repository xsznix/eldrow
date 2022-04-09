import React from 'react';

import FoundWordsList from './FoundWordsList';

import {countFound, getEasyMode} from '../scores';

const {useEffect, useState} = React;

const WORD_COUNT_BY_GUESS_LENGTH = [1, 66, 1716, 6414, 4086, 645, 40, 4];
const EASY_WORD_COUNT_BY_GUESS_LENGTH = [1, 172, 2111, 4618, 3244, 1429, 668, 340, 179, 104, 59, 25, 12, 7, 2, 1];

export default function Scores({easy}) {
  const [guessLength, setGuessLength] = useState(undefined);

  useEffect(() => {
    setGuessLength(undefined);
  }, [easy]);

  return <React.Fragment>
    <section id="scores" aria-labelledby="scores-title">
      <h2 id="scores-title">Score distribution</h2>
      <p>The words you've found, and how many guesses it took to solve for them:</p>
      <div className="scores-grid">
        <div className="score-guess-number header">Guesses</div>
        <div className="score-slider header">Progress</div>
        <div className="score header">Found</div>
        {(easy
          ? EASY_WORD_COUNT_BY_GUESS_LENGTH
          : WORD_COUNT_BY_GUESS_LENGTH
        ).map((totalCount, i) => {
          const found = countFound(i, easy);
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
                <a href="#" onClick={e => {
                  e.preventDefault();
                  setGuessLength(i);
                }}>{found}/{totalCount}</a>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
    {guessLength !== undefined && (
      <FoundWordsList easy={easy} guessLength={guessLength} onClose={() => {
        setGuessLength(undefined);
      }} />
    )}
  </React.Fragment>;
}
